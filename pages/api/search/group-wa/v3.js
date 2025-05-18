import apiConfig from "@/configs/apiConfig";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";
class Scraper {
  constructor() {
    this.baseUrl = `https://${apiConfig.DOMAIN_URL}/api/tools/web/html/v6?url=`;
    this.whatsappBaseUrl = "https://en.groupio.app";
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }
  async fetchPage(url) {
    try {
      const {
        data
      } = await axios.get(url, {
        httpsAgent: this.httpsAgent
      });
      return cheerio.load(data);
    } catch (error) {
      console.error("Error fetching page:", error.message);
      return null;
    }
  }
  async search(query = "meme", limit = 5) {
    const $ = await this.fetchPage(`${this.baseUrl}${this.whatsappBaseUrl}/groups/tag/${encodeURIComponent(query)}`);
    if (!$) return [];
    const results = $(".groups-items-list .group-item").map((_, el) => ({
      title: $(el).find("h2 a").attr("title") || "No Title",
      url: $(el).data("group-link") || "#",
      category: $(el).find(".cat").text() || "No Category",
      hashtags: $(el).find(".hashtags").text().trim() || "No Hashtags",
      date: $(el).find(".info .box.left").text() || "No Date"
    })).get().slice(0, limit);
    try {
      const infoResults = await Promise.all(results.map(result => this.info(result.url)));
      return results.map((result, index) => ({
        ...result,
        ...infoResults[index]
      }));
    } catch (error) {
      console.error("Error during info fetching:", error.message);
      return results;
    }
  }
  extractWhatsAppLinks(text) {
    const matches = text.match(/https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/gi);
    return matches ? matches[0] : "";
  }
  async getHtml(url) {
    try {
      const {
        data
      } = await axios.get(url, {
        httpsAgent: this.httpsAgent
      });
      return data || null;
    } catch (error) {
      console.error("Error fetching redirect:", error.message);
      return null;
    }
  }
  async info(url) {
    const $ = await this.fetchPage(`${this.baseUrl}${url}`);
    if (!$) return null;
    const title = $(".container h1 strong").text() || "No Title";
    const description = $(".description").text().trim() || "No Description";
    let whatsappLink = $(".btn-warning.group-link").attr("href") || "#";
    whatsappLink = whatsappLink.startsWith("http") ? whatsappLink : `${this.whatsappBaseUrl}${whatsappLink}`;
    const result = await this.getHtml(`${this.baseUrl}${whatsappLink}`);
    if (!result) return null;
    return {
      title: title,
      description: description,
      whatsappLink: whatsappLink,
      invite: this.extractWhatsAppLinks(result)
    };
  }
}
export default async function handler(req, res) {
  const {
    action,
    query,
    url,
    limit = 5
  } = req.method === "GET" ? req.query : req.body;
  if (!action) return res.status(400).json({
    error: "Action is required"
  });
  try {
    const search = new Scraper();
    let result;
    switch (action) {
      case "search":
        if (!query) return res.status(400).json({
          error: "Query is required for search"
        });
        result = await search.search(query, limit);
        break;
      case "info":
        if (!url) return res.status(400).json({
          error: "URL is required for info"
        });
        result = await search.info(url);
        break;
      default:
        return res.status(400).json({
          error: `Invalid action: ${action}`
        });
    }
    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
}