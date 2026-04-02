/**
 * Local development server — mimics Vercel serverless environment.
 * Run: node server.js
 * This file is NOT deployed to Vercel; it's for local testing only.
 */
const http = require("http");
const fs   = require("fs");
const path = require("path");
const url  = require("url");

const PORT = 3000;
const handler = require("./api/nps");

const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ── API route ──
  if (pathname === "/api/nps") {
    // Collect body for POST
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (body) {
        try { req.body = JSON.parse(body); } catch { req.body = null; }
      }
      // Mini mock of Vercel's res helpers
      res.status = (code) => { res.statusCode = code; return res; };
      res.json   = (data) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };
      handler(req, res);
    });
    return;
  }

  // ── Static files ──
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ✅  NPS Dashboard running at  http://localhost:${PORT}\n`);
});
