import axios from "axios";
class SunoAPI {
  constructor() {
    this.baseURL = "https://suno.exomlapi.com";
    this.headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://suno.exomlapi.com",
      referer: "https://suno.exomlapi.com/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
    };
    this.interval = 3e3;
    this.timeout = 3e5;
  }
  async generate({
    prompt
  }) {
    console.log("Initiating generation...");
    let taskId, token;
    try {
      const generateResponse = await axios.post(`${this.baseURL}/generate`, {
        prompt: prompt
      }, {
        headers: this.headers
      });
      ({
        taskId,
        token
      } = generateResponse.data);
      console.log(`Generation initiated with Task ID: ${taskId}`);
      const startTime = Date.now();
      while (Date.now() - startTime < this.timeout) {
        console.log(`Polling status for Task ID: ${taskId}...`);
        await new Promise(resolve => setTimeout(resolve, this.interval));
        const statusResponse = await axios.post(`${this.baseURL}/check-status`, {
          taskId: taskId,
          token: token
        }, {
          headers: this.headers
        });
        console.log(`Status: ${statusResponse.data.status}`);
        if (statusResponse.data.results?.every(res => res.audio_url && res.image_url && res.lyrics)) {
          console.log("Generation complete. Results found.");
          return statusResponse.data;
        }
      }
      console.log("Timeout reached.");
      return {
        status: "timeout"
      };
    } catch (error) {
      console.error("Error during generate:", error);
      return {
        status: "error",
        error: error.message
      };
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
    const api = new SunoAPI();
    const response = await api.generate(params);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
}