// const records = [
//   { data: { "Account Name": "Acme Corp", "Score": "10", "Response": "Excellent product, love it!", "Year": "2025", "Month": "January", "Status": "Active" } },
//   { data: { "Account Name": "Globex Inc", "Score": "9", "Response": "Very satisfied with support.", "Year": "2025", "Month": "January", "Status": "Active" } },
//   { data: { "Account Name": "Initech", "Score": "7", "Response": "Good but room for improvement.", "Year": "2025", "Month": "February", "Status": "Active" } },
//   { data: { "Account Name": "Umbrella LLC", "Score": "3", "Response": "Disappointed with recent changes.", "Year": "2025", "Month": "February", "Status": "Churned" } },
//   { data: { "Account Name": "Soylent Corp", "Score": "8", "Response": "Solid platform overall.", "Year": "2025", "Month": "March", "Status": "Active" } },
//   { data: { "Account Name": "Stark Industries", "Score": "10", "Response": "Best in class!", "Year": "2025", "Month": "March", "Status": "Active" } },
//   { data: { "Account Name": "Wayne Enterprises", "Score": "6", "Response": "Needs better onboarding.", "Year": "2025", "Month": "April", "Status": "Active" } },
//   { data: { "Account Name": "Oscorp", "Score": "2", "Response": "Too many bugs.", "Year": "2025", "Month": "April", "Status": "Churned" } },
//   { data: { "Account Name": "Cyberdyne", "Score": "9", "Response": "Fantastic automation features.", "Year": "2025", "Month": "May", "Status": "Active" } },
//   { data: { "Account Name": "Wonka Inc", "Score": "10", "Response": "Sweet experience!", "Year": "2025", "Month": "May", "Status": "Active" } },
//   { data: { "Account Name": "Acme Corp", "Score": "8", "Response": "Still going strong.", "Year": "2025", "Month": "June", "Status": "Active" } },
//   { data: { "Account Name": "Globex Inc", "Score": "5", "Response": "Declined in quality lately.", "Year": "2025", "Month": "June", "Status": "Active" } },
//   { data: { "Account Name": "Initech", "Score": "9", "Response": "Much improved this quarter!", "Year": "2026", "Month": "January", "Status": "Active" } },
//   { data: { "Account Name": "Stark Industries", "Score": "10", "Response": "Consistently amazing.", "Year": "2026", "Month": "February", "Status": "Active" } },
//   { data: { "Account Name": "Umbrella LLC", "Score": "4", "Response": "Not winning me back.", "Year": "2026", "Month": "March", "Status": "Churned" } }
// ];

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
      return res
        .status(400)
        .json({
          success: false,
          error: `Missing fields: ${missing.join(", ")}`,
        });
    records.push({ data: body.data });
    return res.status(201).json({ success: true });
  }
  return res.status(405).json({ success: false, error: "Method not allowed." });
};
