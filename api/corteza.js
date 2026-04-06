module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();

  const {
    CORTEZA_BASE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    NAMESPACE_ID,
    MODULE_ID,
  } = process.env;

  if (
    !CORTEZA_BASE_URL ||
    !CLIENT_ID ||
    !CLIENT_SECRET ||
    !NAMESPACE_ID ||
    !MODULE_ID
  ) {
    console.log("Credentials missing or incomplete, returning mock data");
    return res.status(200).json({ data: generateMockData(24) });
  }

  try {
    // 1. Get Token
    const tokenUrl = `${CORTEZA_BASE_URL}/auth/oauth2/token?grant_type=client_credentials`;
    console.log("📡 [TOKEN] Requesting:", tokenUrl);

    const tokenRes = await fetch(`${CORTEZA_BASE_URL}/auth/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "api",
      }),
    });

    console.log("📡 [TOKEN] URL:", `${CORTEZA_BASE_URL}/auth/oauth2/token`);
    console.log("📡 [TOKEN] Body:", "grant_type=client_credentials&scope=api");

    console.log("📡 [TOKEN] Status:", tokenRes.status);
    const tokenRaw = await tokenRes.text();
    console.log("📡 [TOKEN] Response:", tokenRaw);

    if (!tokenRes.ok) {
      throw new Error(`Failed to get token: ${tokenRes.status} ${tokenRaw}`);
    }

    const tokenData = JSON.parse(tokenRaw);
    const token = tokenData.access_token;
    console.log(
      "✅ [TOKEN] Obtained:",
      token ? `${token.slice(0, 20)}...` : "MISSING",
    );

    // 2. Fetch Data
    const dataUrl = `${CORTEZA_BASE_URL}/api/compose/namespace/${NAMESPACE_ID}/module/${MODULE_ID}/record/`;
    console.log("📡 [DATA] Fetching:", dataUrl);

    const dataRes = await fetch(dataUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json", // ← add this
      },
    });

    console.log("📡 [DATA] Status:", dataRes.status);
    const dataRaw = await dataRes.text();
    console.log("📡 [DATA] Response (first 500 chars):", dataRaw.slice(0, 500));

    if (!dataRes.ok) {
      throw new Error(`Failed to fetch data: ${dataRes.status} ${dataRaw}`);
    }

    const result = JSON.parse(dataRaw);
    const records = result.response?.set ?? [];
    console.log("✅ [DATA] Record count:", records.length);

    // 3. Map Corteza records — values come as [{name, value}] array, convert to object
    const data = records.map((record) => {
      const valuesObj = {};
      (record.values ?? []).forEach(({ name, value }) => {
        valuesObj[name] = value;
      });

      console.log("🔍 [RECORD] Raw values object:", valuesObj);

      return {
        values: {
          "Account Name": valuesObj.AccountNameString ?? "",
          Score: valuesObj.Score ? Number(valuesObj.Score) : null,
          Response: valuesObj.Comment ?? valuesObj.Response ?? "",
          Year: valuesObj.Year ?? "",
          Month: valuesObj.MonthName ?? "",
          Status: valuesObj.Status ?? "",
        },
      };
    });

    console.log("✅ [DATA] Mapped record sample:", data[0]);
    return res.status(200).json({ data });
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

function generateMockData(count) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const accounts = [
    "Global Tech",
    "SoftCorp",
    "Nexus Data",
    "Alpha Systems",
    "BlueWave",
  ];
  const responses = [
    "Excellent service and support!",
    "The UI is a bit confusing but the core features are great.",
    "Disappointed with the recent update.",
    "Perfect for our enterprise needs.",
    "Very easy to integrate with our workflow.",
  ];

  return Array.from({ length: count }, () => {
    const score = Math.floor(Math.random() * 11);
    return {
      values: {
        "Account Name": accounts[Math.floor(Math.random() * accounts.length)],
        Score: score,
        Response: responses[Math.floor(Math.random() * responses.length)],
        Year: "2025",
        Month: months[Math.floor(Math.random() * months.length)],
        Status: Math.random() > 0.2 ? "Active" : "Churned",
      },
    };
  });
}
