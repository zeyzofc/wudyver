import axios from "axios";
import CryptoJS from "crypto-js";
import {
  FormData,
  Blob
} from "formdata-node";
class Dewatermark {
  constructor() {
    this.apiUrl = "https://api.dewatermark.ai/api/object_removal/v5/erase_watermark";
    this.uploadUrl = "https://i.supa.codes/api/upload";
    this.cnKey = "TUFOVUF";
  }
  randomHeaders() {
    return {
      accept: "application/json",
      "content-type": "multipart/form-data",
      "user-agent": `Mozilla/5.0 (Windows NT ${Math.floor(Math.random() * 10) + 6}.0; Win64; x64) AppleWebKit/537.${Math.floor(Math.random() * 50) + 36} (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 30) + 90}.0.${Math.floor(Math.random() * 4e3) + 2e3}.120 Safari/537.${Math.floor(Math.random() * 50) + 36}`,
      "x-forwarded-for": `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };
  }
  async getToken(isPro = false) {
    try {
      console.log("[INFO] Generating token...");
      const key = CryptoJS.enc.Base64.parse(this.cnKey);
      const encode = obj => CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify(obj))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
      const [header, payload] = [{
        alg: "HS256",
        typ: "JWT"
      }, {
        sub: "ignore",
        platform: "web",
        is_pro: isPro,
        exp: Math.floor(Date.now() / 1e3) + 300
      }].map(encode);
      const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(`${header}.${payload}`, key)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
      console.log("[SUCCESS] Token generated.");
      return `${header}.${payload}.${signature}`;
    } catch (e) {
      console.error("[ERROR] Failed to generate token:", e.message);
      throw new Error("Gagal membuat token");
    }
  }
  async fetchImageBuffer(url) {
    try {
      console.log(`[INFO] Fetching image: ${url}`);
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        headers: this.randomHeaders()
      });
      console.log("[SUCCESS] Image fetched.");
      return res.data;
    } catch (e) {
      console.error("[ERROR] Failed to fetch image:", e.message);
      throw new Error("Gagal mengambil gambar");
    }
  }
  async uploadImage(buffer) {
    try {
      console.log("[INFO] Uploading image...");
      const formData = new FormData();
      formData.append("file", new Blob([buffer]), "screenshot.png");
      const res = await axios.post(this.uploadUrl, formData, {
        headers: {
          ...this.randomHeaders()
        }
      });
      if (!res.data?.link) throw new Error("Upload failed");
      console.log("[SUCCESS] Image uploaded.");
      return res.data.link;
    } catch (e) {
      console.error("[ERROR] Failed to upload image:", e.message);
      throw new Error("Error uploading image: " + e.message);
    }
  }
  async removeWatermark({
    url,
    remove_text = true,
    zoom_factor = 2
  }) {
    try {
      console.log("[INFO] Removing watermark...");
      const formData = new FormData();
      if (remove_text) formData.append("remove_text", "true");
      formData.append("zoom_factor", zoom_factor.toString());
      formData.append("original_preview_image", new Blob([await this.fetchImageBuffer(url)], {
        type: "image/jpeg"
      }));
      const res = await axios.post(this.apiUrl, formData, {
        headers: {
          ...this.randomHeaders(),
          authorization: `Bearer ${await this.getToken()}`
        }
      });
      if (res.data?.edited_image?.image) {
        console.log("[SUCCESS] Watermark removed.");
        const uploadedLink = await this.uploadImage(Buffer.from(res.data.edited_image.image, "base64"));
        return {
          url: uploadedLink
        };
      }
      return res.data;
    } catch (e) {
      console.error("[ERROR] Failed to remove watermark:", e.message);
      return {
        error: e.message
      };
    }
  }
}
export default async function handler(req, res) {
  const params = req.method === "GET" ? req.query : req.body;
  if (!params.url) {
    return res.status(400).json({
      error: "Url is required"
    });
  }
  const dewatermark = new Dewatermark();
  try {
    const data = await dewatermark.removeWatermark(params);
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error during chat request"
    });
  }
}