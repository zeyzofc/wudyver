import axios from "axios";
import * as cheerio from "cheerio";
import {
  FormData,
  Blob
} from "formdata-node";
class TetyTTS {
  constructor() {
    this.baseURL = "https://www.tetyys.com/SAPI4/";
    this.uploadUrl = "https://i.supa.codes/api/upload";
    this.headers = {
      accept: "*/*",
      "accept-language": "id-ID,id;q=0.9",
      referer: this.baseURL,
      "sec-ch-ua": '"Chromium";v="131", "Not_A Brand";v="24"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    };
  }
  async list() {
    try {
      const res = await axios.get(this.baseURL, {
        headers: this.headers
      });
      const $ = cheerio.load(res.data);
      const voices = [];
      $("#voice option").each((_, el) => {
        const value = $(el).attr("value");
        if (value) voices.push(value);
      });
      return voices;
    } catch (e) {
      return {
        error: e.message
      };
    }
  }
  async create({
    text = "hello",
    voice = "Sam",
    pitch = 100,
    speed = 150
  }) {
    const params = new URLSearchParams({
      text: text,
      voice: voice,
      pitch: pitch,
      speed: speed
    });
    const url = `${this.baseURL}SAPI4?${params.toString()}`;
    try {
      const res = await axios.get(url, {
        headers: this.headers,
        responseType: "arraybuffer"
      });
      const buffer = res.data;
      const formData = new FormData();
      formData.append("file", new Blob([buffer]), "audio.mp3");
      console.log("[INFO] Uploading to", this.uploadUrl);
      const upload = await axios.post(this.uploadUrl, formData, {
        headers: formData.headers
      });
      console.log("[SUCCESS] Uploaded:", upload.data);
      return upload.data;
    } catch (e) {
      return {
        error: e.message
      };
    }
  }
}
export default async function handler(req, res) {
  const {
    action,
    ...params
  } = req.method === "GET" ? req.query : req.body;
  if (!action) {
    return res.status(400).json({
      error: "Missing required field: action",
      required: {
        action: "list | create"
      }
    });
  }
  const mic = new TetyTTS();
  try {
    let result;
    switch (action) {
      case "list":
        result = await mic[action]();
        break;
      case "create":
        if (!params.text) {
          return res.status(400).json({
            error: `Missing required field: text (required for ${action})`
          });
        }
        result = await mic[action](params);
        break;
      default:
        return res.status(400).json({
          error: `Invalid action: ${action}. Allowed: list | create`
        });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: `Processing error: ${error.message}`
    });
  }
}