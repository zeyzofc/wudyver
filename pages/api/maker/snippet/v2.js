import fetch from "node-fetch";
export default async function handler(req, res) {
  const {
    code,
    title = "app.js",
    theme = "supabase",
    language = "",
    darkMode = "true",
    background = "false"
  } = req.method === "GET" ? req.query : req.body;
  if (!code) return res.status(400).json({
    error: 'Parameter "code" diperlukan'
  });
  try {
    const queryParams = new URLSearchParams({
      code: code,
      title: title,
      theme: theme,
      language: language,
      darkMode: darkMode,
      background: background
    }).toString();
    const url = `https://wudysoft-api.hf.space/rayso?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    return res.status(200).end(Buffer.from(arrayBuffer));
  } catch (error) {
    return res.status(500).json({
      error: "Gagal memproses permintaan",
      details: error.message
    });
  }
}