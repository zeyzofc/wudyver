import apiConfig from "@/configs/apiConfig";
import axios from "axios";
import * as cheerio from "cheerio";
class Scraper {
  constructor() {
    this.baseUrl = `https://${apiConfig.DOMAIN_URL}/api/tools/web/html/v6?url=`;
  }
  async fetchPage(url) {
    try {
      const {
        data
      } = await axios.get(url);
      return cheerio.load(data);
    } catch (error) {
      console.error("Error fetching page:", error.message);
      return null;
    }
  }
  async search(query = "meme", limit = 5) {
    const $ = await this.fetchPage(`${this.baseUrl}https://wpgroups.net/?s=${encodeURIComponent(query)}`);
    if (!$) return [];
    const results = $(".wpGroup").map((_, e) => ({
      title: $(e).find(".content h3").text().trim() || "No Title",
      url: $(e).find("a.wpgroups-card").attr("href") || "No Link",
      image: $(e).find("img").attr("src") || "No Image"
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
  async info(url) {
    const $ = await this.fetchPage(`${this.baseUrl}${url}`);
    if (!$) return null;
    try {
      const join = $(".join-button a").attr("href") || "No Join Link";
      const {
        data: joinData
      } = await axios.get(`${this.baseUrl}${join}`);
      const joinPage = cheerio.load(joinData);
      const whatsappLink = joinPage("#joinButton a").attr("href") || null;
      return {
        title: $("h2").first().text().trim() || "No Title",
        category: $("span.categories a").text().trim() || "No Category",
        country: $("div.links-group a").first().text().trim() || "No Country",
        language: $("div.links-group a").eq(1).text().trim() || "No Language",
        image: $(".godx-group-icon img").attr("src") || "No Image",
        join: join,
        url: whatsappLink
      };
    } catch (error) {
      console.error("Error parsing info:", error.message);
      return {
        title: "No Title",
        whatsapp: "#",
        group: []
      };
    }
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