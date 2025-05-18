import axios from "axios";
import {
  FormData,
  Blob
} from "formdata-node";
import {
  CookieJar
} from "tough-cookie";
import {
  wrapper
} from "axios-cookiejar-support";
import {
  fileTypeFromBuffer
} from "file-type";
import * as cheerio from "cheerio";
class APLDownloader {
  constructor(baseUrl = "https://aplmusicdownloader.net/wp-admin/admin-ajax.php", uploadUrl = "https://i.supa.codes/api/upload") {
    this.baseUrl = baseUrl;
    this.uploadUrl = uploadUrl;
    this.jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar: this.jar,
      withCredentials: true
    }));
  }
  async download({
    url
  }) {
    try {
      console.log("Creating form data...");
      const form = this.createForm(url);
      console.log("Sending POST request...");
      const {
        data: {
          data: {
            data
          }
        }
      } = await this.client.post(this.baseUrl, form, {
        headers: {
          ...form.headers
        }
      });
      const redirectUrl = data["1"]?.redirect_url;
      if (!redirectUrl) throw new Error("Redirect URL not found");
      console.log("Redirect URL:", redirectUrl);
      console.log("Fetching HTML...");
      const html = await this.getHtml(redirectUrl);
      console.log("Extracting metadata from script...");
      const extracted = this.extractFromScript(html);
      if (!extracted?.output?.url) throw new Error("Target URL not found in script");
      console.log("Target Media URL:", extracted.output.url);
      console.log("Following final redirect...");
      const finalUrl = await this.getFinalUrl(extracted.output.url);
      console.log("Final URL:", finalUrl);
      console.log("Downloading and uploading media...");
      const uploadResult = await this.uploadData(finalUrl);
      console.log("Upload successful:", uploadResult);
      return {
        ...extracted.output,
        ...uploadResult
      };
    } catch (error) {
      console.error("Download process error:", error);
      throw error;
    }
  }
  createForm(url) {
    const form = new FormData();
    form.set("post_id", "8");
    form.set("form_id", "cdda83e");
    form.set("referer_title", "Apple Music Downloader - Convert & Download Music to MP3");
    form.set("queried_id", "8");
    form.set("form_fields[music_url]", url);
    form.set("action", "elementor_pro_forms_send_form");
    form.set("referrer", "https://aplmusicdownloader.net/");
    return form;
  }
  async getHtml(url) {
    try {
      const {
        data
      } = await this.client.get(url);
      return data;
    } catch (error) {
      console.error("Error fetching HTML:", error);
      throw error;
    }
  }
  extractFromScript(html) {
    try {
      const $ = cheerio.load(html);
      const script = $("#amd-script-js-extra").html();
      const match = script?.match(/var amdDownloadData = ({[\s\S]+?});/);
      return match ? JSON.parse(match[1]) : null;
    } catch (error) {
      console.error("Error extracting script data:", error);
      return null;
    }
  }
  async getFinalUrl(url) {
    try {
      const res = await this.client.get(url);
      return res.request.res.responseUrl;
    } catch (error) {
      console.error("Error following redirect:", error);
      return url;
    }
  }
  async uploadData(url) {
    try {
      const res = await this.client.get(url, {
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(res.data);
      const type = await fileTypeFromBuffer(buffer);
      const ext = type?.ext || "mp3";
      const form = new FormData();
      form.append("file", new Blob([buffer]), `audio.${ext}`);
      const upload = await axios.post(this.uploadUrl, form, {
        headers: {
          ...form.headers
        }
      });
      return upload.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }
}
export default async function handler(req, res) {
  const params = req.method === "GET" ? req.query : req.body;
  if (!params.prompt) {
    return res.status(400).json({
      error: "Prompt are required"
    });
  }
  try {
    const apl = new APLDownloader();
    const response = await apl.download(params);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
}