"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import SimpleBar from "simplebar-react";
import useWidth from "@/hooks/useWidth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { ToastContainer, toast } from "react-toastify";

const OpenAPIManager = () => {
  const dispatch = useDispatch();
  const width = useWidth();
  const [openAPISpec, setOpenAPISpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpenAPISpec = async () => {
      try {
        const response = await fetch('/api/openapi');
        if (!response.ok) {
          throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setOpenAPISpec(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching the OpenAPI specification.');
        setLoading(false);
      }
    };

    fetchOpenAPISpec();
  }, []);

  const renderSchema = (schema) => {
    if (!schema) return null;

    if (schema.$ref) {
      const refParts = schema.$ref.split('/');
      const refName = refParts[refParts.length - 1];
      return <span className="text-blue-400 font-mono">{`#/components/schemas/${refName}`}</span>;
    }

    if (schema.type) {
      let typeString = <span className="text-green-400 font-mono">{schema.type}</span>;
      if (schema.format) {
        typeString = <><span className="text-green-400 font-mono">{schema.type}</span> <span className="text-gray-400 font-mono">({schema.format})</span></>;
      }
      if (schema.enum) {
        return (
          <>
            {typeString}
            <span className="text-gray-400">, enum: </span>
            {schema.enum.map((val, idx) => (
              <React.Fragment key={idx}>
                <span className="text-yellow-400 font-mono">"{val}"</span>
                {idx < schema.enum.length - 1 && <span className="text-gray-400">, </span>}
              </React.Fragment>
            ))}
          </>
        );
      }
      if (schema.properties) {
        return (
          <>
            {typeString}
            <div className='pl-4'>
              <span className="text-gray-400"> properties: </span>
              {Object.entries(schema.properties).map(([propName, propSchema]) => (
                <div key={propName} className='pl-4'>
                  <span className="text-blue-400 font-mono">{propName}</span>: {renderSchema(propSchema)}
                  {propSchema.description && <p className="text-gray-400 italic pl-4">{propSchema.description}</p>}
                </div>
              ))}
            </div>
          </>
        );
      }
      return typeString;
    }

    if (schema.oneOf) {
      return (
        <>
          <span className="text-gray-400">oneOf:</span>
          <ul className="list-disc list-inside">
            {schema.oneOf.map((subSchema, index) => (
              <li key={index}>
                {renderSchema(subSchema)}
              </li>
            ))}
          </ul>
        </>
      );
    }

    return <span className="text-gray-400">Unknown Schema</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-blue-500">Loading OpenAPI Specification...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <div className="p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-red-400"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className='text-red-400'>Error</h3>
            <p className='text-gray-300'>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!openAPISpec) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No OpenAPI Specification found.</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="bg-slate-800 text-slate-200 border border-slate-700"
      />
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">OpenAPI Specification</h1>

          <Card className="bg-slate-800 border-indigo-700 rounded-3xl shadow-lg mb-8">
            <div className='bg-gradient-to-r from-slate-800 to-purple-900 rounded-t-3xl p-6'>
              <h2 className="text-2xl text-white">Info</h2>
              <p className="text-gray-400">General information about the API.</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="font-semibold text-purple-300">Title:</span>
                <span className="ml-2 text-white">{openAPISpec.info.title}</span>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-purple-300">Description:</span>
                <span className="ml-2 text-slate-400">{openAPISpec.info.description}</span>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-purple-300">Version:</span>
                <span className="ml-2 text-white">{openAPISpec.info.version}</span>
              </div>
              {openAPISpec.info.contact && (
                <div className="mb-4">
                  <span className="font-semibold text-purple-300">Contact:</span>
                  <div className='pl-4'>
                    {openAPISpec.info.contact.name && <p><span className="text-slate-400">Name:</span> <span className="text-white">{openAPISpec.info.contact.name}</span></p>}
                    {openAPISpec.info.contact.url && <p><span className="text-slate-400">URL:</span> <a href={openAPISpec.info.contact.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{openAPISpec.info.contact.url}</a></p>}
                    {openAPISpec.info.contact.email && <p><span className="text-slate-400">Email:</span> <a href={`mailto:${openAPISpec.info.contact.email}`} className="text-blue-400 hover:underline">{openAPISpec.info.contact.email}</a></p>}
                  </div>
                </div>
              )}
              {openAPISpec.info.license && (
                <div>
                  <span className="font-semibold text-purple-300">License:</span>
                  <div className='pl-4'>
                    <p><span className="text-slate-400">Name:</span> <span className="text-white">{openAPISpec.info.license.name}</span></p>
                    <p><span className="text-slate-400">URL:</span> <a href={openAPISpec.info.license.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{openAPISpec.info.license.url}</a></p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {openAPISpec.servers && (
            <Card className="bg-slate-800 border-indigo-700 rounded-3xl shadow-lg mb-8">
              <div className='bg-gradient-to-r from-slate-800 to-purple-900 rounded-t-3xl p-6'>
                <h2 className="text-2xl text-white">Servers</h2>
                <p className="text-slate-400">List of servers the API is available on.</p>
              </div>
              <div className="p-6">
                <ul>
                  {openAPISpec.servers.map((server, index) => (
                    <li key={index} className="mb-2">
                      <span className="font-semibold text-purple-300">URL:</span>
                      <a href={server.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 hover:underline">{server.url}</a>
                      {server.description && <p className="text-slate-400 pl-4">({server.description})</p>}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          <Card className="bg-slate-800 border-indigo-700 rounded-3xl shadow-lg mb-8">
            <div className='bg-gradient-to-r from-slate-800 to-purple-900 rounded-t-3xl p-6'>
              <h2 className="text-2xl text-white">Tags</h2>
              <p className="text-slate-400">
                Logical grouping of operations by resources or endpoints.
              </p>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {openAPISpec.tags.map((tag) => (
                  <span key={tag.name} className="bg-purple-700 text-white px-2 py-1 rounded-full text-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-indigo-700 rounded-3xl shadow-lg">
            <div className='bg-gradient-to-r from-slate-800 to-purple-900 rounded-t-3xl p-6'>
              <h2 className="text-2xl text-white">Paths</h2>
              <p className="text-slate-400">
                List of available API endpoints and their operations.
              </p>
            </div>
            <div className="p-6">
              <SimpleBar style={{ maxHeight: "500px", overflowY: "auto" }}>
                <div className="space-y-4">
                  {Object.entries(openAPISpec.paths).map(([path, operations]) => (
                    <div key={path} className="border-b border-slate-700 pb-4 last:border-b-0">
                      <h3 className="text-lg font-semibold text-white">{path}</h3>
                      {Object.entries(operations).map(([method, operation]) => (
                        <div key={method} className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            method === 'get' ? 'bg-blue-600' :
                              method === 'post' ? 'bg-green-600' :
                                method === 'put' ? 'bg-yellow-600' :
                                  method === 'delete' ? 'bg-red-600' :
                                    'bg-gray-600'
                          }`}>
                            {method.toUpperCase()}
                          </span>
                          <h4 className="text-md font-semibold text-gray-200 ml-2 inline-block">{operation.summary}</h4>
                          <p className="text-slate-400 ml-2 pl-8">{operation.description}</p>

                          {operation.parameters && operation.parameters.length > 0 && (
                            <div className="mt-2 pl-8">
                              <h5 className="font-semibold text-purple-300">Parameters:</h5>
                              <ul className="list-disc list-inside">
                                {operation.parameters.map((param, index) => (
                                  <li key={index} className="text-slate-400">
                                    <span className="font-semibold text-blue-400">{param.name}</span>
                                    <span className="text-slate-400"> (in: {param.in}, required: {param.required ? 'true' : 'false'})</span>
                                    , Schema: {renderSchema(param.schema)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {operation.requestBody && (
                            <div className="mt-2 pl-8">
                              <h5 className="font-semibold text-purple-300">Request Body:</h5>
                              <p className="text-slate-400 ml-2">Description: {operation.requestBody.description}</p>
                              <p className="text-slate-400 ml-2">Required: {operation.requestBody.required ? 'true' : 'false'}</p>
                              {operation.requestBody.content && operation.requestBody.content["application/json"] && operation.requestBody.content["application/json"].schema && (
                                <div className='pl-4'>
                                  <span className="text-slate-400">Schema: </span> {renderSchema(operation.requestBody.content["application/json"].schema)}
                                </div>
                              )}
                              {operation.requestBody.content && operation.requestBody.content["application/json"] && operation.requestBody.content["application/json"].examples && (
                                <div className='pl-4'>
                                  <span className="text-slate-400">Examples: </span>
                                  {Object.entries(operation.requestBody.content["application/json"].examples).map(([exampleName, example]) => (
                                    <div key={exampleName} className='pl-4'>
                                      <span className="text-blue-400 font-mono">{exampleName}</span>:
                                      <pre className="whitespace-pre-wrap text-sm bg-slate-800 p-2 rounded-md border border-slate-700 overflow-auto max-h-48">
                                        {JSON.stringify(example.value, null, 2)}
                                      </pre>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {operation.responses && (
                            <div className="mt-2 pl-8">
                              <h5 className="font-semibold text-purple-300">Responses:</h5>
                              {Object.entries(operation.responses).map(([code, response]) => (
                                <div key={code} className="mt-2">
                                  <span className="text-slate-400">
                                    <span className="font-semibold">{code}</span>: {response.description}
                                  </span>
                                  {response.content && response.content["application/json"] && response.content["application/json"].schema && (
                                    <div className='pl-4'>
                                      <span className="text-slate-400">Content (application/json) Schema:</span>
                                      {renderSchema(response.content["application/json"].schema)}
                                    </div>
                                  )}
                                  {response.content && response.content["application/json"] && response.content["application/json"].examples && (
                                    <div className='pl-4'>
                                      <span className="text-slate-400">Examples: </span>
                                      {Object.entries(response.content["application/json"].examples).map(([exampleName, example]) => (
                                        <div key={exampleName} className='pl-4'>
                                          <span className="text-blue-400 font-mono">{exampleName}</span>:
                                          <pre className="whitespace-pre-wrap text-sm bg-slate-800 p-2 rounded-md border border-slate-700 overflow-auto max-h-48">
                                            {JSON.stringify(example.value, null, 2)}
                                          </pre>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OpenAPIManager;