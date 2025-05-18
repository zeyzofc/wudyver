import axios from "axios";
class Translator {
  constructor() {
    this.libreApiUrl = "https://libretranslate.com/translate";
    this.libreHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
      Referer: "https://www.daytranslations.com/free-translation-online/"
    };
  }
  async translateLibre({
    text,
    from: sourceLang = "auto",
    to: targetLang = "id"
  }) {
    try {
      const response = await axios.post(this.libreApiUrl, {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
        api_key: "ea39cb46-378d-4b24-8a3f-70a34774097c"
      }, {
        headers: this.libreHeaders
      });
      return response.data;
    } catch (error) {
      console.error("Error translating with LibreTranslate:", error);
      return null;
    }
  }
}
export default async function handler(req, res) {
  const params = req.method === "GET" ? req.query : req.body;
  if (!params.text) {
    return res.status(400).json({
      error: "Text is required"
    });
  }
  const translator = new Translator();
  try {
    const data = await translator.translateLibre(params);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}