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
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
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
    const body = req.body ?? (await parseBody(req));

    if (!body || !body.data)
      return res
        .status(400)
        .json({ success: false, error: "Missing 'data' object." });

    const missing = REQUIRED_FIELDS.filter((f) => !body.data[f]);
    if (missing.length > 0)
      return res
        .status(400)
        .json({
          success: false,
          error: `Missing fields: ${missing.join(", ")}`,
        });

    records.push({ data: body.data });
    return res.status(201).json({ success: true, total: records.length });
  }

  return res.status(405).json({ success: false, error: "Method not allowed." });
};
