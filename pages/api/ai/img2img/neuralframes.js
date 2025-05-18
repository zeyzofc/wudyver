import CryptoJS from "crypto-js";
import axios from "axios";
import {
  FormData,
  Blob
} from "formdata-node";
class ImageGenerator {
  constructor(secretKeyHex = "85d3f541b21d0a307566ae59bb49484d3cefcd9f56d42a3de6d965594b71a836", ivHex = "09e1612e1bb08c162a6654437f51e939", bearerTokenPayload = "1dca7ac0450ecefb7d8ba4e6357958489382e4744382db6102c1fad7d95d9780796801dd40c8c7ad5219fb870416eaf7af460beb2d0889656d83281261e2962c", generateCartoonUrl = "https://be.neuralframes.com/tools/generate_cartoon", uploadUrl = "https://i.supa.codes/api/upload") {
    this.secretKeyHex = secretKeyHex;
    this.ivHex = ivHex;
    this.bearerTokenPayload = bearerTokenPayload;
    this.generateCartoonUrl = generateCartoonUrl;
    this.uploadUrl = uploadUrl;
    console.log("ImageGenerator: Instance created.");
  }
  async generateBearerAuth() {
    console.log("ImageGenerator: Generating Bearer Authentication...");
    try {
      if (!this.secretKeyHex || !this.ivHex) {
        const error = new Error("Secret key/IV missing.");
        console.error("ImageGenerator: Error generating Bearer Authentication:", error);
        return error;
      }
      const token = `Bearer ${CryptoJS.AES.encrypt(this.bearerTokenPayload, CryptoJS.enc.Hex.parse(this.secretKeyHex), {
iv: CryptoJS.enc.Hex.parse(this.ivHex),
mode: CryptoJS.mode.CBC,
padding: CryptoJS.pad.Pkcs7
}).toString()}`;
      console.log("ImageGenerator: Bearer Authentication generated successfully.");
      return token;
    } catch (error) {
      console.error("ImageGenerator: Error during Bearer Authentication generation:", error);
      throw error;
    }
  }
  async getBase64FromUrl({
    url
  }) {
    console.log(`ImageGenerator: Fetching base64 from URL: ${url}`);
    try {
      const {
        data,
        headers
      } = await axios.get(url, {
        responseType: "arraybuffer"
      });
      const base64 = Buffer.from(data, "binary").toString("base64");
      const contentType = headers["content-type"];
      console.log(`ImageGenerator: Successfully fetched base64. Content type: ${contentType.substring(0, 20)}...`);
      return {
        base64: base64,
        contentType: contentType
      };
    } catch (error) {
      console.error(`ImageGenerator: Error fetching base64 from URL ${url}:`, error);
      throw error;
    }
  }
  async uploadImage({
    base64Image
  }) {
    console.log("ImageGenerator: Uploading image...");
    try {
      if (!base64Image?.startsWith("data:")) {
        const error = new Error("Input harus berupa data base64 URL.");
        console.error("ImageGenerator: Error uploading image:", error);
        throw error;
      }
      const [metadata, base64Data] = base64Image.split(",");
      const buffer = Buffer.from(base64Data, "base64");
      const contentType = metadata?.split(":")[1]?.split(";")[0] || "image/png";
      const filename = `generated_image.${contentType.split("/")[1] || "png"}`;
      const formData = new FormData();
      formData.append("file", new Blob([buffer], {
        type: contentType
      }), filename);
      console.log(`ImageGenerator: Preparing to upload ${filename} with content type ${contentType}`);
      const {
        data
      } = await axios.post(this.uploadUrl, formData, {
        headers: formData.headers
      });
      console.log("ImageGenerator: Image uploaded successfully:", data);
      return data;
    } catch (error) {
      console.error("ImageGenerator: Error during image upload:", error);
      throw error;
    }
  }
  async generate({
    imageUrl,
    styleUrl = "https://img.freepik.com/premium-photo/stock-photo-cute-animal_759095-65008.jpg?w=740",
    strength = .75
  }) {
    console.log(`ImageGenerator: Generating image with URL: ${imageUrl}, style URL: ${styleUrl}, strength: ${strength}`);
    try {
      const bearerToken = await this.generateBearerAuth();
      if (bearerToken instanceof Error) {
        return Promise.reject(bearerToken);
      }
      let base64Image = imageUrl;
      if (imageUrl?.startsWith("http") || imageUrl?.startsWith("https")) {
        const imageData = await this.getBase64FromUrl({
          url: imageUrl
        });
        base64Image = `data:${imageData.contentType};base64,${imageData.base64}`;
        console.log("ImageGenerator: Image URL converted to base64.");
      }
      console.log("ImageGenerator: Sending request to generate cartoon API...");
      const {
        data
      } = await axios.post(this.generateCartoonUrl, {
        image: base64Image,
        strength: strength,
        styleImage: styleUrl
      }, {
        headers: {
          accept: "application/json, text/plain, */*",
          acceptLanguage: "id-ID,id;q=0.9",
          authorization: bearerToken,
          cacheControl: "no-cache",
          contentType: "application/json",
          origin: "https://www.neuralframes.com",
          pragma: "no-cache",
          priority: "u=1, i",
          referer: "https://www.neuralframes.com/",
          secChUa: '"Chromium";v="131", "Not_A Brand";v="24", "Microsoft Edge Simulate";v="131", "Lemur";v="131"',
          secChUaMobile: "?1",
          secChUaPlatform: '"Android"',
          secFetchDest: "empty",
          secFetchMode: "cors",
          secFetchSite: "same-site",
          userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
        }
      });
      console.log("ImageGenerator: Generate cartoon API response:", data);
      if (data?.success && data?.imageUrl?.startsWith("data:")) {
        console.log("ImageGenerator: Generated image is in base64 format, proceeding to upload.");
        return await this.uploadImage({
          base64Image: data.imageUrl
        });
      } else if (data?.success && data?.imageUrl) {
        console.log("ImageGenerator: Generated image URL received (not base64).");
        return {
          generatedImageUrl: data.imageUrl,
          uploadResult: "Gambar dihasilkan (bukan base64), perlu diunggah terpisah."
        };
      } else {
        const error = "Gagal menghasilkan gambar dari API.";
        console.error("ImageGenerator: Error during image generation:", error, data);
        return Promise.reject(error);
      }
    } catch (error) {
      console.error("ImageGenerator: Error during the image generation process:", error);
      throw error;
    }
  }
}
export default async function handler(req, res) {
  const params = req.method === "GET" ? req.query : req.body;
  try {
    if (!params.imageUrl) {
      return res.status(400).json({
        error: "imageUrl is required"
      });
    }
    const generator = new ImageGenerator();
    const data = await generator.generate(params);
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error during image generation request",
      details: error.message || error
    });
  }
}