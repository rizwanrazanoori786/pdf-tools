# PDFlayer PDF Tools (Frontend + Proxy)

## Setup
1. Put your PDFlayer access key in `.env`:

```
PDFLAYER_ACCESS_KEY=YOUR_ACCESS_KEY_HERE
```

2. Install dependencies and start the server:

```
npm install
node server.js
```

3. Open `http://localhost:3000` in your browser.

## Notes
- The proxy keeps the PDFlayer access key on the server.
- URL mode uses a GET request to PDFlayer.
- HTML mode uses a POST request to PDFlayer.
- Extra options supported in the UI: header/footer text + alignment, watermark settings, delay, and DPI.
