const records = [];

const REQUIRED_FIELDS = [
  "Account Name",
  "Score",
  "Response",
  "Year",
  "Month",
  "Status",
];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json(records);
  if (req.method === "POST") {
    const body = req.body;
    if (!body || !body.data)
      return res
        .status(400)
        .json({ success: false, error: "Missing 'data' object." });
    const missing = REQUIRED_FIELDS.filter((f) => !body.data[f]);
    if (missing.length > 0)
      return res.status(400).json({
        success: false,
        error: `Missing fields: ${missing.join(", ")}`,
      });
    records.push({ data: body.data });
    return res.status(201).json({ success: true });
  }
  return res.status(405).json({ success: false, error: "Method not allowed." });
};
