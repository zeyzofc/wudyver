import apiConfig from "@/configs/apiConfig";
import {
  FormData
} from "formdata-node";
import axios from "axios";
const linksConvert = {
  "video-gif": {
    url: "https://ezgif.com/video-to-gif",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10,
      method: "ffmpeg"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "gif-mp4": {
    url: "https://ezgif.com/gif-to-mp4",
    params: {
      convert: "Convert GIF to MP4!"
    },
    req_params: [],
    split: {
      start: '" controls><source src="',
      end: '" type="video/mp4">Your browser'
    },
    either_params: []
  },
  "video-jpg": {
    url: "https://ezgif.com/video-to-jpg",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10
    },
    req_params: [],
    split: {
      start: '"small button danger" href="',
      end: '">Download frames as ZIP'
    },
    either_params: []
  },
  "video-png": {
    url: "https://ezgif.com/video-to-png",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10
    },
    req_params: [],
    split: {
      start: '"small button danger" href="',
      end: '">Download frames as ZIP'
    },
    either_params: []
  },
  "gif-png": {
    url: "https://ezgif.com/split",
    params: {
      method: "im"
    },
    req_params: [],
    split: {
      start: '"small button danger" href="',
      end: '">Download frames as ZIP'
    },
    either_params: []
  },
  "gif-sprite": {
    url: "https://ezgif.com/gif-to-sprite",
    params: {},
    req_params: ["format"],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: ["horizontally", "vertically", "custom"]
  },
  "sprite-imgage": {
    url: "https://ezgif.com/sprite-cutter",
    params: {},
    req_params: ["format"],
    split: {
      start: '"small button danger" href="',
      end: '">Download frames as ZIP'
    },
    either_params: ["by-grid", "by-size"]
  },
  "sprite-img": {
    url: "https://ezgif.com/sprite-cutter",
    params: {},
    req_params: ["format"],
    split: {
      start: '"small button danger" href="',
      end: '">Download frames as ZIP'
    },
    either_params: ["by-grid", "by-size"]
  },
  "bmp-jpg": {
    url: "https://ezgif.com/bmp-to-jpg",
    params: {
      format: "jpg"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "bmp-png": {
    url: "https://ezgif.com/bmp-to-jpg",
    params: {
      format: "png"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "bmp-gif": {
    url: "https://ezgif.com/bmp-to-jpg",
    params: {
      format: "gif"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "png-jpg": {
    url: "https://ezgif.com/png-to-jpg",
    params: {
      format: "jpg",
      percentage: 85,
      background: "#ffffff"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "png-gif": {
    url: "https://ezgif.com/png-to-jpg",
    params: {
      format: "gif",
      percentage: 85,
      background: "#ffffff"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "png-bmp": {
    url: "https://ezgif.com/png-to-jpg",
    params: {
      format: "bmp",
      percentage: 85,
      background: "#ffffff"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "gif-jpg": {
    url: "https://ezgif.com/gif-to-jpg",
    params: {
      background: "#ffffff"
    },
    req_params: [],
    split: {
      start: '"small button danger" href="',
      end: '">Download all files as ZIP archive'
    },
    either_params: []
  },
  "svg-png": {
    url: "https://ezgif.com/svg-to-png",
    params: {
      currentcolor: "#000000"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "svg-jpg": {
    url: "https://ezgif.com/svg-to-jpg",
    params: {
      percentage: 85,
      background: "#ffffff",
      currentcolor: "#000000"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "apng-gif": {
    url: "https://ezgif.com/apng-to-gif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "apng-webp": {
    url: "https://ezgif.com/apng-to-webp",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "apng-mp4": {
    url: "https://ezgif.com/apng-to-mp4",
    params: {},
    req_params: [],
    split: {
      start: '<source src="',
      end: '" type="video/mp4">'
    },
    either_params: []
  },
  "mng-apng": {
    url: "https://ezgif.com/mng-to-apng",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "video-apng": {
    url: "https://ezgif.com/video-to-apng",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10,
      method: "ffmpeg"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "gif-apng": {
    url: "https://ezgif.com/gif-to-apng",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "video-webp": {
    url: "https://ezgif.com/video-to-webp",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10,
      loop: "on"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "gif-webp": {
    url: "https://ezgif.com/gif-to-webp",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "jpg-webp": {
    url: "https://ezgif.com/jpg-to-webp",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "png-webp": {
    url: "https://ezgif.com/png-to-webp",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "webp-gif": {
    url: "https://ezgif.com/webp-to-gif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "webp-jpg": {
    url: "https://ezgif.com/webp-to-jpg",
    params: {},
    req_params: [],
    split: {
      start: '"small button danger" href="',
      end: '">Download all files as ZIP archive'
    },
    either_params: []
  },
  "webp-png": {
    url: "https://ezgif.com/webp-to-png",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "webp-mp4": {
    url: "https://ezgif.com/webp-to-mp4",
    params: {},
    req_params: [],
    split: {
      start: '" controls><source src="',
      end: '" type="video/mp4">Your browser'
    },
    either_params: []
  },
  "video-avif": {
    url: "https://ezgif.com/video-to-avif",
    params: {
      start: 0,
      end: 10,
      size: "original",
      fps: 10
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "gif-avif": {
    url: "https://ezgif.com/gif-to-avif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "apng-avif": {
    url: "https://ezgif.com/apng-to-avif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "webp-avif": {
    url: "https://ezgif.com/webp-to-avif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "jpg-avif": {
    url: "https://ezgif.com/jpg-to-avif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "avif-gif": {
    url: "https://ezgif.com/avif-to-gif",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "avif-jpg": {
    url: "https://ezgif.com/avif-to-jpg",
    params: {
      percentage: 85,
      background: "#ffffff"
    },
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  },
  "avif-png": {
    url: "https://ezgif.com/avif-to-png",
    params: {},
    req_params: [],
    split: {
      start: '<img src="',
      end: '" style="width:'
    },
    either_params: []
  }
};
async function convert(fields) {
  if ("string" == typeof fields && "list" === fields?.toLowerCase()) return Object.keys(linksConvert);
  let type = linksConvert?.[fields?.type];
  if (!type) throw new Error(`Invalid conversion type "${fields?.type}"`);
  let form = new FormData();
  if (fields?.file) {
    if (!fields.filename) throw new Error("filename must be provided to upload files.(with extension)");
    form.append("new-image", fields.file, {
      filename: fields.filename
    });
  } else {
    if (!fields?.url) throw new Error("Either file or url field is required.");
    form.append("new-image-url", fields.url);
  }
  delete fields.type, delete fields.file, delete fields.filename, delete fields.url;
  let org_keys = Object.keys(fields);
  if (type.req_params && type.req_params.forEach(e => {
      if (!org_keys.includes(e)) throw new Error(`"${e}" is a required param.`);
    }), type.either_params.length) {
    let check = !1;
    if (type.either_params.forEach(e => {
        org_keys.includes(e) && (check = !0);
      }), !check) throw new Error(`Either one of these params has to be provided: ${type.either_params.join(", ")}`);
  }
  let link = await axios({
      method: "post",
      url: type.url,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: form
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    redir = String(link?.request?.res?.responseUrl);
  if (!redir) throw new Error("Oops! Something unknown happened!");
  let id = redir.split("/")[redir.split("/").length - 1];
  type.params.file = id;
  let image = await axios({
      method: "post",
      url: `${redir}?ajax=true`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: new URLSearchParams({
        ...type.params,
        ...fields
      })
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    img_url = `https:${image?.data?.toString()?.split(type.split.start)?.[1].split(type.split.end)?.[0]?.replace("https:", "")}`;
  if (img_url.includes("undefined")) throw new Error("Something unknown happened here... please report to the creator");
  return img_url;
}
async function overlay(fields) {
  let form = new FormData(),
    form_over = new FormData();
  form.append("new-image", fields.file, {
    filename: fields.filename
  });
  let link = await axios({
      method: "post",
      url: "https://ezgif.com/overlay",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: form
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    redir = String(link?.request?.res?.responseUrl);
  if (!redir) throw new Error("Oops! Something unknown happened!");
  let id = redir.split("/")[redir.split("/").length - 1];
  form_over.append("new-overlay", Buffer.from(fields.overlay.file), {
    filename: `${fields.overlay.filename}`
  }), form_over.append("overlay", "Upload image!");
  let link_over = await axios({
      method: "post",
      url: redir,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: form_over
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    redir_over = String(link_over?.request?.res?.responseUrl);
  if (!redir_over) throw new Error("Oops! Something unknown happened!");
  let id_over = redir_over.split("/")[redir_over.split("/").length - 1],
    image = await axios({
      method: "post",
      url: `${redir_over}?ajax=true`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: new URLSearchParams({
        file: id,
        "overlay-file": id_over,
        posX: fields.x || 0,
        posY: fields.y || 0
      })
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    img_url = `https:${image?.data?.toString()?.split('<img src="')?.[1].split('" style="width:')?.[0]?.replace("https:", "")}`;
  if (img_url.includes("undefined")) throw new Error("Something unknown happened here... please report to the creator");
  return img_url;
}
const linksRender = {
  gif: "https://ezgif.com/maker",
  webp: "https://ezgif.com/webp-maker",
  apng: "https://ezgif.com/apng-maker",
  avif: "https://ezgif.com/avif-maker"
};
async function render(fields) {
  let type = linksRender?.[fields?.type],
    form = new FormData();
  if (!type) throw new Error(`Invalid rendering type "${fields?.type}"`);
  fields = {
    delay: 20,
    dfrom: 1,
    dto: 5,
    "fader-delay": 6,
    "fader-frames": 10,
    loop: 0,
    "delays[]": [],
    "files[]": [],
    ...fields
  };
  for (let i = 0; i < fields.files.length; i++) {
    if (!fields.files[i].data) throw new Error(`File buffer not provided for files[${i}]`);
    if (!fields.files[i].name) throw new Error(`File name not provided for files[${i}]`);
    form.append("files[]", fields.files[i].data, {
      filename: fields.files[i].name
    }), fields["delays[]"].push(fields.files[i].delay ?? fields.delay);
  }
  delete fields.type, delete fields.files, form.append("msort", "1"), form.append("upload", "Upload and make a GIF!");
  let link = await axios({
      method: "post",
      url: type,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      data: form
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    redir = String(link?.request?.res?.responseUrl),
    html = await axios.get(redir);
  fields.file = redir.split("/")[redir.split("/").length - 1], html.data.toString().split("(drag and drop frames to change order)")[1].split('<p class="options"><strong>Toggle a range of frames:</strong>')[0]?.split('<span class="frame-tools">').slice(0, -1).map(i => i.split('value="')[1].split('" name="files[]"')[0]).forEach(e => {
    fields["files[]"].push(e);
  });
  let image = await axios({
      method: "post",
      url: `${redir}?ajax=true`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: new URLSearchParams(fields)
    }).catch(function(error) {
      throw error.response ? new Error(JSON.stringify({
        statusCode: error.response.status,
        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator."
      }, null, 4)) : new Error("Oops, something unknown happened! :(");
    }),
    img_url = `https:${image?.data?.toString()?.split('<img src="')?.[1].split('" style="width')?.[0]?.replace("https:", "")}`;
  if (img_url.includes("undefined")) throw new Error("Something unknown happened here... please report to the creator");
  return img_url;
}
const validTypes = ["apng-avif", "apng-gif", "apng-mp4", "apng-webp", "avif-gif", "avif-jpg", "avif-png", "bmp-gif", "bmp-jpg", "bmp-png", "gif-apng", "gif-avif", "gif-jpg", "gif-mp4", "gif-png", "gif-sprite", "gif-webp", "jpg-avif", "jpg-webp", "mng-apng", "png-bmp", "png-gif", "png-jpg", "png-webp", "sprite-img", "sprite-imgage", "svg-jpg", "svg-png", "video-apng", "video-avif", "video-gif", "video-jpg", "video-png", "video-webp", "webp-avif", "webp-gif", "webp-jpg", "webp-mp4", "webp-png"];
export default async function handler(req, res) {
  const {
    type = "png-jpg",
      url = `https://${apiConfig.DOMAIN_URL}/favicon.png`,
      option = "convert",
      delay = 20,
      files = []
  } = req.method === "GET" ? req.query : req.body;
  if (option === "convert") {
    if (!url || !type) {
      return res.status(400).json({
        error: "Missing URL or type"
      });
    }
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Allowed types are: ${validTypes.join(", ")}`
      });
    }
    try {
      const result = await convert({
        type: type,
        url: url
      });
      return res.status(200).json(result instanceof Object ? result : {
        result: result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error.message
      });
    }
  }
  if (option === "render") {
    try {
      const fields = {
        delay: delay,
        files: JSON.parse(files)
      };
      const result = await render(fields);
      return res.status(200).json(result instanceof Object ? result : {
        result: result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error.message
      });
    }
  }
  if (option === "overlay") {
    try {
      const fields = {
        file: req.files?.file,
        filename: req.files?.filename
      };
      const result = await overlay(fields);
      return res.status(200).json(result instanceof Object ? result : {
        result: result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: error.message
      });
    }
  }
  return res.status(400).json({
    error: "Invalid option"
  });
}