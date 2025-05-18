import fetch from "node-fetch";
class Arya {
  constructor(baseURL = "https://nexra.aryahcr.cc") {
    this.baseURL = baseURL;
  }
  extractJson(str) {
    const match = str.match(/({.*?})/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return match[0];
      }
    }
    return null;
  }
  async postData(decode, endpoint, data) {
    try {
      const url = `${this.baseURL}/${endpoint}`,
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }),
        text = await response.text();
      return Buffer.isBuffer(text) ? text.toString() : decode ? JSON.parse(text) : this.extractJson(text);
    } catch (error) {
      throw console.error("Error in postData:", error), error;
    }
  }
  async complementImage(model, prompt, additionalData = {}) {
    const requestData = {
      prompt: prompt || "An serene sunset landscape where a river winds through gentle hills covered in trees. The sky is tinged with warm and soft tones, with scattered clouds reflecting the last glimmers of the sun.",
      model: model,
      ...additionalData
    };
    return await this.postData(!1, "api/image/complements", requestData);
  }
  async stablediffusion15(prompt, model) {
    return await this.complementImage(model ?? "stablediffusion-1.5", prompt);
  }
  async stablediffusion21(prompt, model) {
    return await this.complementImage(model ?? "stablediffusion-2.1", prompt, {
      data: {
        prompt_negative: "",
        guidance_scale: 9
      }
    });
  }
  async stablediffusionXL(prompt, model, style) {
    return await this.complementImage(model ?? "stablediffusion-xl", prompt, {
      data: {
        prompt_negative: "",
        image_style: style ?? "(No style)",
        guidance_scale: 7.5
      }
    });
  }
  async pixartA(prompt, model, style) {
    return await this.complementImage(model ?? "pixart-a", prompt, {
      data: {
        prompt_negative: "",
        sampler: "DPM-Solver",
        image_style: style ?? "Anime",
        width: 1024,
        height: 1024,
        dpm_guidance_scale: 4.5,
        dpm_inference_steps: 14,
        sa_guidance_scale: 3,
        sa_inference_steps: 25
      }
    });
  }
  async pixartLcm(prompt, model) {
    return await this.complementImage(model ?? "pixart-lcm", prompt, {
      data: {
        prompt_negative: "",
        image_style: "Fantasy art",
        width: 1024,
        height: 1024,
        lcm_inference_steps: 9
      }
    });
  }
  async dalle(prompt, model) {
    return await this.complementImage(model ?? "dalle", prompt);
  }
  async dalleMini(prompt, model) {
    return await this.complementImage(model ?? "dalle-mini", prompt);
  }
  async prodia(prompt, modelA, modelB) {
    return await this.complementImage(modelA ?? "prodia", prompt, {
      data: {
        model: modelB ?? "absolutereality_V16.safetensors [37db0fc3]",
        steps: 25,
        cfg_scale: 7,
        sampler: "DPM++ 2M Karras",
        negative_prompt: ""
      }
    });
  }
  async prodiaStablediffusion(prompt, modelA, modelB) {
    return await this.complementImage(modelA ?? "prodia-stablediffusion", prompt, {
      data: {
        prompt_negative: "",
        model: modelB ?? "absolutereality_v181.safetensors [3d9d4d2b]",
        sampling_method: "DPM++ 2M Karras",
        sampling_steps: 25,
        width: 512,
        height: 512,
        cfg_scale: 7
      }
    });
  }
  async prodiaStablediffusionXL(prompt, modelA, modelB) {
    return await this.complementImage(modelA ?? "prodia-stablediffusion-xl", prompt, {
      data: {
        prompt_negative: "",
        model: modelB ?? "sd_xl_base_1.0.safetensors [be9edd61]",
        sampling_method: "DPM++ 2M Karras",
        sampling_steps: 25,
        width: 1024,
        height: 1024,
        cfg_scale: 7
      }
    });
  }
  async emi(prompt, model) {
    return await this.complementImage(model ?? "emi", prompt);
  }
  async chatGPT(assistant, user, prompt, model) {
    return await this.postData(!0, "api/chat/gpt", {
      messages: [{
        role: "assistant",
        content: assistant ?? "Saya AI dari OpenAI, diciptakan untuk membantu Anda mengeksplorasi ide, bertukar informasi, dan menyelesaikan masalah. Ada yang bisa saya bantu? How are you today?"
      }, {
        role: "user",
        content: user ?? "Hello, my name is OpenAI."
      }],
      prompt: prompt ?? "Can you repeat my name?",
      model: model ?? "GPT-4",
      markdown: !1
    });
  }
  async chatComplements(assistant, user, model, conversation_style) {
    return await this.postData(!0, "api/chat/complements", {
      messages: [{
        role: "assistant",
        content: assistant ?? "Saya AI dari OpenAI, diciptakan untuk membantu Anda mengeksplorasi ide, bertukar informasi, dan menyelesaikan masalah. Ada yang bisa saya bantu? How are you today?"
      }, {
        role: "user",
        content: user ?? "Hello, my name is OpenAI."
      }],
      conversation_style: conversation_style ?? "Balanced",
      markdown: !1,
      stream: !1,
      model: model ?? "Bing"
    });
  }
  async translate(text, source, target) {
    return await this.postData(!0, "api/translate/", {
      text: text,
      source: source,
      target: target
    });
  }
}
export default async function handler(req, res) {
  const {
    action
  } = req.method === "GET" ? req.query : req.body;
  if (!action) {
    return res.status(400).json({
      error: "Missing 'action' query parameter"
    });
  }
  const arya = new Arya();
  const {
    prompt,
    model,
    assistant,
    user,
    text,
    source,
    target,
    style,
    modelA,
    modelB
  } = req.method === "GET" ? req.query : req.body;
  try {
    let result;
    switch (action) {
      case "stablediffusion15":
        result = await arya.stablediffusion15(prompt, model);
        break;
      case "stablediffusion21":
        result = await arya.stablediffusion21(prompt, model);
        break;
      case "stablediffusionXL":
        result = await arya.stablediffusionXL(prompt, model, style);
        break;
      case "pixartA":
        result = await arya.pixartA(prompt, model, style);
        break;
      case "pixartLcm":
        result = await arya.pixartLcm(prompt, model);
        break;
      case "dalle":
        result = await arya.dalle(prompt, model);
        break;
      case "dalleMini":
        result = await arya.dalleMini(prompt, model);
        break;
      case "prodia":
        result = await arya.prodia(prompt, modelA, modelB);
        break;
      case "prodiaStablediffusion":
        result = await arya.prodiaStablediffusion(prompt, modelA, modelB);
        break;
      case "prodiaStablediffusionXL":
        result = await arya.prodiaStablediffusionXL(prompt, modelA, modelB);
        break;
      case "emi":
        result = await arya.emi(prompt, model);
        break;
      case "chatGPT":
        result = await arya.chatGPT(assistant, user, prompt, model);
        break;
      case "chatComplements":
        result = await arya.chatComplements(assistant, user, model, style);
        break;
      case "translate":
        result = await arya.translate(text, source, target);
        break;
      default:
        return res.status(400).json({
          error: `Invalid action: ${action}`
        });
    }
    return res.status(200).json({
      result: result
    });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({
      error: "Server error"
    });
  }
}