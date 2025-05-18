"use client"

import { useEffect, useState } from "react"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"
import { Disclosure } from "@headlessui/react"

const APIExplorerPage = () => {
  const [apis, setApis] = useState({})
  const [loading, setLoading] = useState(true)
  const [sortedTagKeys, setSortedTagKeys] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const res = await fetch("/api/openapi")
        const data = await res.json()
        const paths = data?.paths || {}
        const grouped = {}

        Object.entries(paths).forEach(([path, methods]) => {
          Object.entries(methods).forEach(([method, details]) => {
            const tag = details.tags?.[0] || "Others"
            if (!grouped[tag]) grouped[tag] = []
            grouped[tag].push({ path, method, details })
          })
        })

        const sortedKeys = Object.keys(grouped).sort()
        setSortedTagKeys(sortedKeys)
        setApis(grouped)
        
        // Set the first tag as selected by default
        if (sortedKeys.length > 0) {
          setSelectedTag(sortedKeys[0])
        }
      } catch (err) {
        console.error("Failed to fetch spec:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSpec()
  }, [])

  const methodColors = {
    GET: "bg-emerald-900 text-emerald-300 border border-emerald-700",
    POST: "bg-blue-900 text-blue-300 border border-blue-700",
    PUT: "bg-amber-900 text-amber-300 border border-amber-700",
    DELETE: "bg-rose-900 text-rose-300 border border-rose-700",
    PATCH: "bg-purple-900 text-purple-300 border border-purple-700",
  }

  const handleTagChange = (tag) => {
    setSelectedTag(tag)
  }

  return (
    <div className="w-full px-2 py-6">
      <Card
        bodyClass="relative p-6 h-full overflow-hidden"
        className="w-full border border-indigo-700 rounded-3xl shadow-lg bg-white text-slate-900"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
            <span className="text-2xl">🔌</span>
          </div>
          <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            API Explorer
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-cyan-400">Loading API specifications...</p>
          </div>
        ) : sortedTagKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-800 rounded-2xl border border-slate-700">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-slate-400">No API Endpoints Found.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {/* Tag Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
              {sortedTagKeys.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagChange(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTag === tag
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {tag} ({apis[tag].length})
                </button>
              ))}
            </div>

            {/* Selected Tag Content */}
            {selectedTag && (
              <div className="mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-800 text-white mr-3">
                    <span className="text-lg">🏷️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-cyan-300">{selectedTag}</h3>
                </div>

                <div className="space-y-3">
                  {apis[selectedTag].map((api, idx) => (
                    <Disclosure key={idx}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl flex justify-between cursor-pointer transition-all duration-200 font-medium w-full text-start text-sm text-slate-300 px-6 py-4">
                            <div className="flex items-center">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-lg mr-3 ${
                                  methodColors[api.method.toUpperCase()] || "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {api.method.toUpperCase()}
                              </span>
                              <span className="font-mono text-cyan-300">{api.path}</span>
                            </div>
                            <span
                              className={`${
                                open ? "rotate-180" : ""
                              } transition-all duration-200 text-xl text-cyan-400`}
                            >
                              <Icon icon="heroicons:chevron-down-solid" />
                            </span>
                          </Disclosure.Button>
                          <Disclosure.Panel>
                            <div className="bg-slate-900 text-sm rounded-b-xl border border-slate-700 border-t-0 px-6 py-5 -mt-1">
                              <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                  <span className="text-xs text-slate-400">Description:</span>
                                  <p className="text-slate-300">
                                    {api.details.summary || api.details.description || "No description available"}
                                  </p>
                                </div>

                                {api.details.parameters && api.details.parameters.length > 0 && (
                                  <div className="flex flex-col space-y-2">
                                    <span className="text-xs text-slate-400">Parameters:</span>
                                    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                      {api.details.parameters.map((param, pIdx) => (
                                        <div key={pIdx} className="flex items-start mb-2 last:mb-0">
                                          <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded mr-2">
                                            {param.name}
                                          </span>
                                          <span className="text-xs text-slate-400">
                                            {param.required ? "(required)" : "(optional)"} -{" "}
                                            {param.description || "No description"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end">
                                  {api.method.toUpperCase() === "GET" ? (
                                    <a
                                      href={api.path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center bg-cyan-800 hover:bg-cyan-700 text-white text-xs px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                                    >
                                      <span className="mr-2">▶️</span>
                                      Execute
                                    </a>
                                  ) : (
                                    <span className="text-xs italic text-slate-500 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                                      <span className="mr-2">⚠️</span>
                                      Not executable directly
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default APIExplorerPage