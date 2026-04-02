const REQUIRED_FIELDS = [
  "Account Name",
  "Score",
  "Response",
  "Year",
  "Month",
  "Status",
];
const records = [];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json(records);
  }

  if (req.method === "POST") {
    // Read raw body as string first
    const rawBody = req.body ? JSON.stringify(req.body) : await parseBody(req);

    // Log what we received
    console.log("RAW BODY:", rawBody);
    console.log("CONTENT-TYPE:", req.headers["content-type"]);

    // Try to parse it
    let parsed = null;
    try {
      parsed = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: "JSON parse failed",
        received: rawBody,
        contentType: req.headers["content-type"],
      });
    }

    if (!parsed || !parsed.data) {
      return res.status(400).json({
        success: false,
        error: "Missing 'data' object",
        received: parsed,
        rawBody: rawBody,
      });
    }

    const missing = REQUIRED_FIELDS.filter((f) => !parsed.data[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missing.join(", ")}`,
        receivedData: parsed.data,
      });
    }

    records.push({ data: parsed.data });
    return res.status(201).json({ success: true, total: records.length });
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};
