"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useWidth from "@/hooks/useWidth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import { ToastContainer, toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import axios from "axios";
import {
  setPastes,
  addPaste,
  removePaste,
  clearPastes,
  setError,
  setLoading,
} from "@/components/partials/app/paste/store"; // Path to your Redux slice

const PasteManager = () => {
  const dispatch = useDispatch();
  const { pastes, loading, error } = useSelector((state) => state.paste);
  const width = useWidth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [syntax, setSyntax] = useState("text");
  const [expireIn, setExpireIn] = useState("");
  const [deleteKey, setDeleteKey] = useState("");
  const [viewKey, setViewKey] = useState("");
  const [viewedPaste, setViewedPaste] = useState(null);

  const apiUrl = "/api/tools/paste/v1";

  const fetchPasteList = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(`${apiUrl}?action=list`);
      dispatch(setPastes(response.data));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.response?.data?.error || "Gagal mengambil daftar paste"));
      dispatch(setLoading(false));
      toast.error(err.response?.data?.error || "Gagal mengambil daftar paste", {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
    }
  };

  const handleCreatePaste = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post(apiUrl, {
        action: "create",
        title: title,
        content: content,
        syntax: syntax,
        expireIn: expireIn,
      });
      dispatch(addPaste(response.data));
      dispatch(setLoading(false));
      toast.success(`Paste berhasil dibuat dengan key: ${response.data.key}`, {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
      setTitle("");
      setContent("");
      setSyntax("text");
      setExpireIn("");
    } catch (err) {
      dispatch(setError(err.response?.data?.error || "Gagal membuat paste"));
      dispatch(setLoading(false));
      toast.error(err.response?.data?.error || "Gagal membuat paste", {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
    }
  };

  const handleGetPaste = async () => {
    dispatch(setLoading(true));
    setViewedPaste(null);
    try {
      const response = await axios.get(`${apiUrl}?action=get&key=${viewKey}`);
      setViewedPaste(response.data);
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError(err.response?.data?.error || "Gagal mengambil paste"));
      dispatch(setLoading(false));
      toast.error(err.response?.data?.error || "Gagal mengambil paste", {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
    }
  };

  const handleDeletePaste = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.delete(`${apiUrl}?action=delete&key=${deleteKey}`);
      dispatch(removePaste(deleteKey));
      dispatch(setLoading(false));
      toast.success(response.data.message, {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
      setDeleteKey("");
    } catch (err) {
      dispatch(setError(err.response?.data?.error || "Gagal menghapus paste"));
      dispatch(setLoading(false));
      toast.error(err.response?.data?.error || "Gagal menghapus paste", {
        toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
      });
    }
  };

  const handleClearAllPastes = async () => {
    if (window.confirm("Apakah kamu yakin ingin menghapus semua paste?")) {
      dispatch(setLoading(true));
      try {
        const response = await axios.delete(`${apiUrl}?action=clear`);
        dispatch(clearPastes());
        dispatch(setLoading(false));
        toast.success(response.data.message, {
          toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
        });
      } catch (err) {
        dispatch(setError(err.response?.data?.error || "Gagal menghapus semua paste"));
        dispatch(setLoading(false));
        toast.error(err.response?.data?.error || "Gagal menghapus semua paste", {
          toastClassName: "bg-slate-800 text-slate-200 border border-slate-700",
        });
      }
    }
  };

  useEffect(() => {
    fetchPasteList();
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="bg-slate-800 text-slate-200 border border-slate-700"
      />
      <div className="w-full px-2 py-6">
        <Card
          bodyClass="relative p-6 h-full overflow-hidden"
          className="w-full border border-indigo-700 rounded-3xl shadow-lg bg-white text-slate-900"
        >
          <SimpleBar className="h-full">
            <div className="p-6 border-b border-purple-800 bg-gradient-to-r from-slate-800 to-purple-900 rounded-t-3xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-lg">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500">
                Kelola Paste
              </h4>
              <p className="text-sm text-center text-slate-400 mt-2">Buat, lihat, dan hapus paste dengan mudah</p>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <label className="block text-sm font-medium text-purple-300 mb-3 flex items-center">
                  <span className="mr-2">➕</span>
                  Buat Paste Baru
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Judul</label>
                    <Textinput
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Syntax</label>
                    <select
                      className="w-full bg-slate-900 border-slate-700 text-slate-200 rounded-xl p-2 text-sm"
                      value={syntax}
                      onChange={(e) => setSyntax(e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      {/* Tambahkan opsi syntax lain sesuai kebutuhan */}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-purple-300 mb-1">Konten</label>
                    <textarea
                      className="w-full h-24 bg-slate-900 border-slate-700 text-slate-200 rounded-xl p-2 text-sm"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Kadaluarsa (detik)</label>
                    <Textinput
                      type="number"
                      value={expireIn}
                      onChange={(e) => setExpireIn(e.target.value)}
                      placeholder="Contoh: 3600"
                      className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Button
                      text={
                        loading ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⟳</span> Membuat...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <span className="mr-2">💾</span> Buat
                          </span>
                        )
                      }
                      className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 text-white rounded-xl py-2 font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      isLoading={loading}
                      disabled={loading}
                      onClick={handleCreatePaste}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <label className="block text-sm font-medium text-purple-300 mb-3 flex items-center">
                  <span className="mr-2">🔎</span>
                  Lihat Paste Berdasarkan Key
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Key</label>
                    <Textinput
                      type="text"
                      value={viewKey}
                      onChange={(e) => setViewKey(e.target.value)}
                      placeholder="Masukkan Key"
                      className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Button
                      text={
                        loading ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⟳</span> Mencari...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <span className="mr-2">👀</span> Lihat
                          </span>
                        )
                      }
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl py-2 font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      isLoading={loading}
                      disabled={loading}
                      onClick={handleGetPaste}
                    />
                  </div>
                  {viewedPaste && (
                    <div className="col-span-full mt-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <h5 className="font-semibold text-purple-300 mb-2">Detail Paste:</h5>
                      <p className="text-slate-300 mb-1"><strong>Judul:</strong> {viewedPaste.title}</p>
                      <p className="text-slate-300 mb-1"><strong>Konten:</strong></p>
                      <pre className="whitespace-pre-wrap text-sm bg-slate-800 p-2 rounded-md border border-slate-700">{viewedPaste.content}</pre>
                      <p className="text-slate-300 mb-1"><strong>Syntax:</strong> {viewedPaste.syntax}</p>
                      {viewedPaste.expiresAt && (
                        <p className="text-slate-300 mb-1">
                          <strong>Kadaluarsa:</strong>{" "}
                          {new Date(viewedPaste.expiresAt).toLocaleString()}
                        </p>
                      )}
                      <p className="text-slate-300">
                        <strong>Link:</strong>{" "}
                        <a
                          href={`/api/tools/paste/v1?action=get&key=${viewedPaste.key}&output=html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {`${viewedPaste.key}`}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6 bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <label className="block text-sm font-medium text-purple-300 mb-3 flex items-center">
                  <span className="mr-2">🗑️</span>
                  Hapus Paste Berdasarkan Key
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-purple-300 mb-1">Key</label>
                    <Textinput
                      type="text"
                      value={deleteKey}
                      onChange={(e) => setDeleteKey(e.target.value)}
                      placeholder="Masukkan Key"
                      className="bg-slate-900 border-slate-700 text-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <Button
                      text={
                        loading ? (
                          <span className="flex items-center justify-center">
                            <span className="animate-spin mr-2">⟳</span> Menghapus...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <span className="mr-2">🔥</span> Hapus
                          </span>
                        )
                      }
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl py-2 font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                      isLoading={loading}
                      disabled={loading}
                      onClick={handleDeletePaste}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-purple-300 flex items-center">
                    <span className="mr-2">📜</span>
                    Daftar Semua Paste
                  </label>
                  <Button
                    text={
                      loading ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin mr-2">⟳</span> Membersihkan...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">🧹</span> Hapus Semua
                        </span>
                      )
                    }
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl py-2 font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    isLoading={loading}
                    disabled={loading}
                    onClick={handleClearAllPastes}
                  />
                </div>
                <SimpleBar style={{ maxHeight: "300px" }}>
                  {pastes && pastes.length > 0 ? (
                    <ul className="list-none p-0">
                      {pastes.map((paste) => (
                        <li
                          key={paste._id}
                          className="py-2 border-b last:border-b-0 text-slate-300"
                        >
                          <strong className="text-purple-300">Judul:</strong> {paste.title} -{" "}
                          <strong className="text-purple-300">Key:</strong>{" "}
                          <a
                            href={`/api/tools/paste/v1?action=get&key=${paste.key}&output=html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {paste.key}
                          </a>
                          {paste.expiresAt && (
                            <span className="text-gray-500 text-sm">
                              {" "}
                              (Kadaluarsa: {new Date(paste.expiresAt).toLocaleDateString()})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">Belum ada paste.</p>
                  )}
                </SimpleBar>
              </div>
            </div>
          </SimpleBar>
        </Card>
      </div>
    </>
  );
};

export default PasteManager;