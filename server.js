const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "https://api.pdflayer.com/api/convert";
const ACCESS_KEY = process.env.PDFLAYER_ACCESS_KEY;

if (!ACCESS_KEY) {
  console.warn("Missing PDFLAYER_ACCESS_KEY in .env");
}

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname)));

const allowedOptions = new Set([
  "document_name",
  "page_size",
  "orientation",
  "inline",
  "margin_top",
  "margin_right",
  "margin_bottom",
  "margin_left",
  "header_text",
  "header_align",
  "header_spacing",
  "footer_text",
  "footer_align",
  "footer_spacing",
  "watermark_url",
  "watermark_opacity",
  "watermark_in_background",
  "watermark_offset_x",
  "watermark_offset_y",
  "delay",
  "dpi",
]);

function buildParams(body) {
  const params = new URLSearchParams();
  params.set("access_key", ACCESS_KEY || "");

  Object.keys(body).forEach((key) => {
    if (allowedOptions.has(key) && body[key] !== undefined && body[key] !== "") {
      params.set(key, body[key]);
    }
  });

  return params;
}

app.post("/api/convert", async (req, res) => {
  try {
    if (!ACCESS_KEY) {
      res.status(500).json({ error: "Server is missing PDFLAYER_ACCESS_KEY." });
      return;
    }

    const { mode, document_url, document_html } = req.body || {};

    if (mode !== "url" && mode !== "html") {
      res.status(400).json({ error: "Mode must be 'url' or 'html'." });
      return;
    }

    const params = buildParams(req.body || {});

    let response;

    if (mode === "url") {
      if (!document_url) {
        res.status(400).json({ error: "document_url is required." });
        return;
      }
      params.set("document_url", document_url);
      const url = `${API_BASE}?${params.toString()}`;
      response = await fetch(url, { method: "GET" });
    } else {
      if (!document_html) {
        res.status(400).json({ error: "document_html is required." });
        return;
      }
      params.set("document_html", document_html);
      response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    }

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok || contentType.includes("application/json")) {
      const text = await response.text();
      res.status(response.status).set("Content-Type", "application/json");
      res.send(text || JSON.stringify({ error: "PDFlayer error" }));
      return;
    }

    res.status(response.status);
    if (contentType) {
      res.set("Content-Type", contentType);
    }

    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      res.set("Content-Disposition", disposition);
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "Unexpected server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
