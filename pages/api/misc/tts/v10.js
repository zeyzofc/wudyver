import axios from "axios";
import {
  FormData,
  Blob
} from "formdata-node";
class Speechma {
  constructor() {
    this.baseURL = "https://speechma.com";
    this.scriptURL = "https://speechma.com/script.js?v=1743935266";
    this.ttsEndpoint = `${this.baseURL}/com.api/tts-api.php`;
    this.uploadUrl = "https://i.supa.codes/api/upload";
  }
  async list() {
    try {
      const {
        data
      } = await axios.get(this.scriptURL);
      const match = data.match(/this\.voices\s*=\s*\[([\s\S]*?)\];/);
      if (!match) throw new Error("Voice array not found");
      let arrayContent = `[${match[1]}]`;
      arrayContent = arrayContent.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":').replace(/'/g, '"');
      const voices = JSON.parse(arrayContent);
      return voices;
    } catch (e) {
      console.error("[Speechma] Failed to fetch voice list:", e);
      return [];
    }
  }
  async create({
    text,
    voice = "voice-108",
    pitch = 0,
    rate = 0
  }) {
    try {
      const res = await axios.post(this.ttsEndpoint, {
        text: text,
        voice: voice,
        pitch: pitch,
        rate: rate
      }, {
        headers: {
          "content-type": "application/json",
          origin: this.baseURL,
          referer: this.baseURL,
          "user-agent": "Mozilla/5.0"
        },
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(res.data);
      const uploadResult = await this.uploadBuffer(buffer);
      return uploadResult;
    } catch (e) {
      console.error("[Speechma] TTS generation failed:", e);
      return {
        error: e
      };
    }
  }
  async uploadBuffer(buffer) {
    try {
      const form = new FormData();
      form.append("file", new Blob([buffer], {
        type: "audio/mpeg"
      }), "tts.mp3");
      const res = await axios.post(this.uploadUrl, form, {
        headers: form.headers
      });
      console.log("[Speechma] Upload response:", res.data);
      return res.data;
    } catch (e) {
      console.error("[Speechma] Upload failed:", e);
      return {
        error: e
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
  const mic = new Speechma();
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