import axios from "axios";
import * as cheerio from "cheerio";
class Donghua {
  baseUrl = "https://donghua.web.id";
  headers = {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36"
  };
  async search(query) {
    try {
      const data = (await axios.get(`${this.baseUrl}/?s=${encodeURIComponent(query)}`, {
        headers: this.headers
      })).data;
      const $ = cheerio.load(data);
      const animeData = $("article").map((i, e) => ({
        title: $(e).find("h2").text(),
        status: $(e).find(".epx").text(),
        type: $(e).find(".typez").text(),
        url: $(e).find("a").attr("href")
      })).get();
      return animeData.length < 1 ? {
        creator: "Wudysoft",
        status: false,
        msg: "Movie/Serial not found!"
      } : {
        creator: "Wudysoft",
        status: true,
        data: animeData
      };
    } catch (error) {
      console.error(error);
      return {
        creator: "Wudysoft",
        status: false
      };
    }
  }
  replacer(str) {
    return str.replace(new RegExp("diposting oleh", "g"), "author").replace(new RegExp("tipe", "g"), "type").replace(new RegExp("dirilis", "g"), "release").replace(new RegExp("total episode", "g"), "episode").replace(new RegExp("durasi", "g"), "duration").replace(new RegExp("diperbarui pada", "g"), "updated");
  }
  async fetch(url) {
    try {
      const data = (await axios.get(url, {
        headers: this.headers
      })).data;
      const $ = cheerio.load(data);
      const infoContentHtml = $("div.info-content").html();
      const spanElements = $(infoContentHtml).find("span");
      const genreElements = $(".genxed").find("a");
      const eplisterLiElements = $("div.eplister").find("li");
      const spanData = {};
      spanElements.each((i, e) => {
        const parts = $(e).text().split(":");
        if (parts.length === 2) {
          spanData[this.replacer(parts[0]?.toLowerCase().trim())] = this.replacer(parts[1].trim());
        }
      });
      const genreData = genreElements.map((i, e) => $(e).text()).get();
      const episodesData = eplisterLiElements.map((i, e) => ({
        eps: $(e).find(".epl-num").text(),
        title: `Episode ${$(e).find(".epl-num").text()}`,
        release: $(e).find(".epl-date").text(),
        url: $(e).find("a").attr("href")
      })).get();
      return {
        creator: "Wudysoft",
        status: true,
        data: {
          thumbnail: $($("div.bigcontent").find("noscript").html()).attr("src"),
          title: $("h1.entry-title").text(),
          ...spanData,
          rating: $($(".rating")[0]).text().split(" ")[2]?.trim(),
          genre: genreData.join(", "),
          episodes: episodesData
        }
      };
    } catch (error) {
      console.error(error);
      return {
        creator: "Wudysoft",
        status: false
      };
    }
  }
  async stream(url) {
    try {
      const data = (await axios.get(url, {
        headers: this.headers
      })).data;
      const stream = cheerio.load(data)("div.player-embed").find("iframe").attr("src");
      if (!stream) {
        return {
          creator: "Wudysoft",
          status: false,
          msg: "Streaming URL not found!"
        };
      }
      const streamUrl = "https:" + stream;
      const streamData = (await axios.get(streamUrl, {
        headers: this.headers
      })).data.match(/sources:(.*?)\n/)[1].replace(/],/g, "]");
      return {
        creator: "Wudysoft",
        status: true,
        data: {
          url: streamUrl,
          file: JSON.parse(streamData.trim().replace(/ /g, "").replace(/"/g, "").replace(/'/g, '"').replace(/src/g, '"src"').replace(/size/g, '"size"').replace(/type/g, '"type"'))
        }
      };
    } catch (error) {
      console.error(error);
      return {
        creator: "Wudysoft",
        status: false
      };
    }
  }
}
export default async function handler(req, res) {
  const donghua = new Donghua();
  const {
    method
  } = req;
  const {
    query,
    action,
    url
  } = req.method === "GET" ? req.query : req.body;
  if (action === "search") {
    const response = await donghua.search(query);
    return res.status(200).json(response);
  }
  if (action === "fetch" && url) {
    const response = await donghua.fetch(url);
    return res.status(200).json(response);
  }
  if (action === "stream" && url) {
    const response = await donghua.stream(url);
    return res.status(200).json(response);
  }
  return res.status(400).json({
    creator: "Wudysoft",
    status: false,
    msg: "Invalid action or missing parameters!"
  });
}