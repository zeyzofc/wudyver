import axios from "axios";
import * as cheerio from "cheerio";
const fdroid = {
  search: async query => {
    const {
      data: html
    } = await axios.get(`https://search.f-droid.org/?q=${encodeURIComponent(query)}&lang=en`);
    const $ = cheerio.load(html);
    if ($(".main-content").text().includes("It looks like F-Droid does not have any apps matching your search string")) return `Pencarian "${query}" tidak ditemukan..`;
    return $(".package-header").map((_, element) => ({
      name: $(element).find(".package-name").text().trim(),
      summary: $(element).find(".package-summary").text().trim(),
      license: $(element).find(".package-license").text().trim(),
      link: $(element).attr("href"),
      icon: $(element).find(".package-icon").attr("src")
    })).get();
  },
  package: async url => {
    const {
      data: html
    } = await axios.get(url);
    const $ = cheerio.load(html);
    const packname = $(".package-name").text().trim();
    const packsuma = $(".package-summary").text().trim();
    const packdesc = $(".package-description").html().trim();
    const packlinks = $(".package-links a").map((_, element) => ({
      text: $(element).text().trim(),
      href: $(element).attr("href")
    })).get();
    const versions = $(".package-version").map((_, element) => ({
      version: $(element).find(".package-version-header b").text().trim(),
      added: $(element).find(".package-version-header").text().split("Added on").pop().trim(),
      requirements: $(element).find(".package-version-requirement").text().trim(),
      link: $(element).find(".package-version-download a").attr("href"),
      size: $(element).find(".package-version-download").contents().filter((_, el) => el.nodeType === 3).text().trim().replace(/\n/g, "").replace(/\|/g, "").trim()
    })).get();
    return {
      name: packname,
      summary: packsuma,
      description: packdesc,
      links: packlinks,
      versions: versions
    };
  }
};
export default async function handler(req, res) {
  const {
    method,
    query
  } = req;
  if (method === "GET") {
    try {
      if (query.type === "search" && query.q) {
        const searchResult = await fdroid.search(query.q);
        return res.status(200).json(searchResult);
      }
      if (query.type === "package" && query.url) {
        const packageDetails = await fdroid.package(query.url);
        return res.status(200).json(packageDetails);
      }
      return res.status(400).json({
        error: "Invalid query parameters"
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch data"
      });
    }
  }
  return res.status(405).json({
    error: "Method not allowed"
  });
}