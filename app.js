const els = {
  documentUrl: document.getElementById("documentUrl"),
  documentHtml: document.getElementById("documentHtml"),
  documentName: document.getElementById("documentName"),
  pageSize: document.getElementById("pageSize"),
  orientation: document.getElementById("orientation"),
  inline: document.getElementById("inline"),
  marginTop: document.getElementById("marginTop"),
  marginRight: document.getElementById("marginRight"),
  marginBottom: document.getElementById("marginBottom"),
  marginLeft: document.getElementById("marginLeft"),
  headerText: document.getElementById("headerText"),
  headerAlign: document.getElementById("headerAlign"),
  headerSpacing: document.getElementById("headerSpacing"),
  footerText: document.getElementById("footerText"),
  footerAlign: document.getElementById("footerAlign"),
  footerSpacing: document.getElementById("footerSpacing"),
  watermarkUrl: document.getElementById("watermarkUrl"),
  watermarkOpacity: document.getElementById("watermarkOpacity"),
  watermarkInBackground: document.getElementById("watermarkInBackground"),
  watermarkOffsetX: document.getElementById("watermarkOffsetX"),
  watermarkOffsetY: document.getElementById("watermarkOffsetY"),
  delay: document.getElementById("delay"),
  dpi: document.getElementById("dpi"),
  urlMode: document.getElementById("urlMode"),
  htmlMode: document.getElementById("htmlMode"),
  requestPreview: document.getElementById("requestPreview"),
  copyUrl: document.getElementById("copyUrl"),
  generateBtn: document.getElementById("generateBtn"),
  fillSample: document.getElementById("fillSample"),
};

const modeInputs = Array.from(document.querySelectorAll("input[name='mode']"));

const apiBase = "/api/convert";

const sampleHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; }
      h1 { color: #f08f3c; }
      .card { border: 1px solid #eee; padding: 20px; border-radius: 12px; }
    </style>
  </head>
  <body>
    <h1>Hello PDFlayer</h1>
    <div class="card">
      <p>This PDF was generated from raw HTML.</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
  </body>
</html>`;

function currentMode() {
  const checked = modeInputs.find((input) => input.checked);
  return checked ? checked.value : "url";
}

function readOptionalFields() {
  const params = {
    document_name: els.documentName.value.trim(),
    page_size: els.pageSize.value,
    orientation: els.orientation.value,
    inline: els.inline.value,
    margin_top: els.marginTop.value,
    margin_right: els.marginRight.value,
    margin_bottom: els.marginBottom.value,
    margin_left: els.marginLeft.value,
    header_text: els.headerText.value.trim(),
    header_align: els.headerAlign.value,
    header_spacing: els.headerSpacing.value,
    footer_text: els.footerText.value.trim(),
    footer_align: els.footerAlign.value,
    footer_spacing: els.footerSpacing.value,
    watermark_url: els.watermarkUrl.value.trim(),
    watermark_opacity: els.watermarkOpacity.value,
    watermark_in_background: els.watermarkInBackground.value,
    watermark_offset_x: els.watermarkOffsetX.value,
    watermark_offset_y: els.watermarkOffsetY.value,
    delay: els.delay.value,
    dpi: els.dpi.value,
  };

  Object.keys(params).forEach((key) => {
    if (params[key] === "") {
      delete params[key];
    }
  });

  return params;
}

function buildPayload() {
  const mode = currentMode();
  const payload = {
    mode,
    ...readOptionalFields(),
  };

  if (mode === "url") {
    payload.document_url = els.documentUrl.value.trim();
  } else {
    payload.document_html = els.documentHtml.value.trim();
  }

  return payload;
}

function updatePreview() {
  const mode = currentMode();

  if (mode === "url") {
    els.urlMode.classList.remove("hidden");
    els.htmlMode.classList.add("hidden");
  } else {
    els.urlMode.classList.add("hidden");
    els.htmlMode.classList.remove("hidden");
  }

  const payload = buildPayload();
  if (payload.document_html) {
    payload.document_html = "<html>...";
  }

  els.requestPreview.textContent = "POST " + apiBase + "\n" + JSON.stringify(payload, null, 2);
}

async function handleGenerate() {
  const mode = currentMode();

  if (mode === "url" && !els.documentUrl.value.trim()) {
    alert("Please enter a document URL.");
    return;
  }

  if (mode === "html" && !els.documentHtml.value.trim()) {
    alert("Please paste HTML to convert.");
    return;
  }

  const payload = buildPayload();

  try {
    const response = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const err = await response.json();
        alert(err?.error || "PDF generation failed.");
      } else {
        alert("PDF generation failed.");
      }
      return;
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      alert(data?.error || "PDFlayer returned an error.");
      return;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const shouldDownload = payload.inline === "0";

    if (shouldDownload) {
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${payload.document_name || "document"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
      return;
    }

    window.open(blobUrl, "_blank", "noopener");
  } catch (error) {
    alert("Network error. Please try again.");
  }
}

function copyPreview() {
  const text = els.requestPreview.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    els.copyUrl.textContent = "Copied";
    setTimeout(() => (els.copyUrl.textContent = "Copy Request"), 1200);
  });
}

modeInputs.forEach((input) => input.addEventListener("change", updatePreview));
[
  els.documentUrl,
  els.documentHtml,
  els.documentName,
  els.pageSize,
  els.orientation,
  els.inline,
  els.marginTop,
  els.marginRight,
  els.marginBottom,
  els.marginLeft,
  els.headerText,
  els.headerAlign,
  els.headerSpacing,
  els.footerText,
  els.footerAlign,
  els.footerSpacing,
  els.watermarkUrl,
  els.watermarkOpacity,
  els.watermarkInBackground,
  els.watermarkOffsetX,
  els.watermarkOffsetY,
  els.delay,
  els.dpi,
].forEach((el) => el.addEventListener("input", updatePreview));

els.generateBtn.addEventListener("click", handleGenerate);
els.copyUrl.addEventListener("click", copyPreview);
els.fillSample.addEventListener("click", () => {
  els.documentHtml.value = sampleHtml;
  updatePreview();
});

updatePreview();
