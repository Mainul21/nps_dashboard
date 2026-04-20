/**
 * Business Unit API
 * 1. Gets token from Corteza OAuth
 * 2. Fetches people data from the people module (428173443465674753)
 * 3. Matches user email against selise_email field
 * 4. Extracts business unit
 * 5. Fetches all NPS records (with pagination) from NPS module
 * 6. Filters NPS records by the matched business unit
 */

const urlModule = require("url");

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Parse email from query string
  const parsed = urlModule.parse(req.url, true);
  const email = parsed.query.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "email query parameter is required",
    });
  }

  const {
    CORTEZA_BASE_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    NAMESPACE_ID,
    EMPLOYEE_MODULE_ID,
    MODULE_ID,
    BUSINESS_UNIT_NAMESPACE_ID,
    BUSINESS_UNIT_MODULE_ID,
  } = process.env;

  if (!CORTEZA_BASE_URL || !CLIENT_ID || !CLIENT_SECRET || !NAMESPACE_ID) {
    return res.status(500).json({
      success: false,
      error:
        "Missing server configuration (CORTEZA_BASE_URL / CLIENT_ID / CLIENT_SECRET / NAMESPACE_ID)",
    });
  }

  const employeeModuleId = EMPLOYEE_MODULE_ID || "428173443465674753";
  const npsModuleId = MODULE_ID || "454782398924587009";
  const businessUnitNamespaceId = BUSINESS_UNIT_NAMESPACE_ID || "389091856357720065";
  const businessUnitModuleId = BUSINESS_UNIT_MODULE_ID || "427539736995823617";

  try {
    // ── Step 1: Obtain access token ──────────────────────────────────────────
    console.log("📡 [BUSINESSUNIT] Requesting OAuth token...");
    const token = await getToken(CORTEZA_BASE_URL, CLIENT_ID, CLIENT_SECRET);
    console.log("✅ [BUSINESSUNIT] Token obtained");

    // ── Step 2: Fetch all people records (paginated) ─────────────────────────
    console.log(
      `📡 [BUSINESSUNIT] Fetching people from module ${employeeModuleId}...`,
    );
    const people = await fetchAllRecords(
      CORTEZA_BASE_URL,
      NAMESPACE_ID,
      employeeModuleId,
      token,
    );
    console.log(`✅ [BUSINESSUNIT] Total people records: ${people.length}`);

    // ── Step 3: Match email (case-insensitive) ───────────────────────────────
    const emailLower = email.toLowerCase().trim();
    let matched = null;

    for (const record of people) {
      const vals = flattenValues(record.values);

      // Try every likely field name for the Selise email
      const seliseEmail = (
        vals.selise_email ||
        vals.SeliseEmail ||
        vals.seliseEmail ||
        vals.Email ||
        vals.email ||
        ""
      )
        .toLowerCase()
        .trim();

      if (seliseEmail === emailLower) {
        matched = vals;
        break;
      }
    }

    if (!matched) {
      console.log(`❌ [BUSINESSUNIT] No person matched email: ${email}`);
      return res.status(404).json({
        success: false,
        error: `No employee found with email: ${email}`,
      });
    }

    console.log(
      "✅ [BUSINESSUNIT] Matched person fields:",
      Object.keys(matched),
    );

    // ── Step 4: Extract business unit ────────────────────────────────────────
    const businessUnit = (
      matched.BusinessUnitID ||
      matched.business_unit ||
      matched.BusinessUnit ||
      matched.business_Unit ||
      matched.Department ||
      matched.department ||
      ""
    ).trim();

    const personName = (
      matched.full_name ||
      matched.FullName ||
      matched.fullName ||
      matched.Name ||
      matched.name ||
      email
    ).trim();

    if (!businessUnit) {
      console.log(`⚠️  [BUSINESSUNIT] No business unit for: ${email}`);
      return res.status(404).json({
        success: false,
        error: "Business unit not found for this employee",
        employeeFields: Object.keys(matched),
      });
    }

    console.log(
      `✅ [BUSINESSUNIT] Business Unit: "${businessUnit}" for "${personName}"`,
    );

    // ── Step 4.5: Fetch Business Unit Name ─────────────────────────────────
    console.log(
      `📡 [BUSINESSUNIT] Fetching Business Unit Name for ID: ${businessUnit}...`,
    );
    let businessUnitName = businessUnit;
    try {
      const buRecords = await fetchAllRecords(
        CORTEZA_BASE_URL,
        businessUnitNamespaceId,
        businessUnitModuleId,
        token,
      );
      
      console.log(`📋 [BUSINESSUNIT] Fetched ${buRecords.length} Business Unit records, looking for ID: ${businessUnit}`);
      
      for (const record of buRecords) {
        const vals = flattenValues(record.values);
        const recordId = record.id || record.recordID;
        
        console.log(`  🔍 Checking record ID: ${recordId}, fields: ${Object.keys(vals).join(", ")}`);
        
        if (recordId === businessUnit) {
          businessUnitName = vals.Name || vals.BusinessUnitName || vals.name || businessUnit;
          console.log(`✅ [BUSINESSUNIT] Business Unit Name: "${businessUnitName}"`);
          break;
        }
      }
      
      if (businessUnitName === businessUnit) {
        console.log(`⚠️  [BUSINESSUNIT] No matching BU record found for ID: ${businessUnit}`);
      }
    } catch (error) {
      console.warn(`⚠️  [BUSINESSUNIT] Could not fetch BU name: ${error.message}`);
      // Continue without BU name if fetch fails
    }

    // ── Step 5: Fetch all NPS records (paginated) ────────────────────────────
    console.log(
      `📡 [BUSINESSUNIT] Fetching NPS records from module ${npsModuleId}...`,
    );
    const npsRaw = await fetchAllRecords(
      CORTEZA_BASE_URL,
      NAMESPACE_ID,
      npsModuleId,
      token,
    );
    console.log(
      `✅ [BUSINESSUNIT] Total NPS records fetched: ${npsRaw.length}`,
    );

    // ── Step 6: Map & filter NPS records by business unit ───────────────────
    const allNps = npsRaw.map((record) => {
      const vals = flattenValues(record.values);
      return {
        values: {
          "Account Name":
            vals.AccountNameString ||
            vals.AccountName ||
            vals["Account Name"] ||
            "",
          Score: vals.Score ? Number(vals.Score) : null,
          Response: vals.Comment || vals.Response || vals.comment || "",
          Year: vals.Year || "",
          Month: vals.MonthName || vals.Month || "",
          Status: vals.Status || "",
          BusinessUnit:
            vals.BU || vals.BusinessUnit || vals.business_unit || vals.Department || "",
        },
      };
    });

    // Filter: match business unit field OR account name (flexible matching)
    const buLower = businessUnit.toLowerCase();
    const filteredNps = allNps.filter((record) => {
      const v = record.values;
      const recBu = (v.BusinessUnit || "").toLowerCase();
      const recAccount = (v["Account Name"] || "").toLowerCase();
      return recBu === buLower || recAccount === buLower;
    });

    console.log(
      `✅ [BUSINESSUNIT] Filtered ${filteredNps.length} / ${allNps.length} NPS records for BU: "${businessUnit}"`,
    );

    return res.status(200).json({
      success: true,
      employee: {
        email: email,
        name: personName,
        businessUnit: businessUnit,
      },
      businessUnitInfo: {
        id: businessUnit,
        name: businessUnitName,
      },
      npsData: {
        count: filteredNps.length,
        totalRecords: allNps.length,
        records: filteredNps,
      },
    });
  } catch (error) {
    console.error("❌ [BUSINESSUNIT] Unhandled error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Get OAuth2 client-credentials token from Corteza
 */
async function getToken(baseUrl, clientId, clientSecret) {
  const tokenRes = await fetch(`${baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "api",
    }),
  });

  const raw = await tokenRes.text();
  if (!tokenRes.ok) {
    throw new Error(`Token request failed (${tokenRes.status}): ${raw}`);
  }

  const data = JSON.parse(raw);
  if (!data.access_token) {
    throw new Error(`No access_token in response: ${raw}`);
  }
  return data.access_token;
}

/**
 * Fetch ALL records from a Corteza module using cursor-based pagination.
 * The provided URL already uses incPageNavigation=true so we get cursors.
 */
async function fetchAllRecords(baseUrl, namespaceId, moduleId, token) {
  const PAGE_SIZE = 200;
  const allRecords = [];
  let cursor = null;
  let page = 1;

  do {
    const params = new URLSearchParams({
      query: "",
      deleted: "0",
      incTotal: "true",
      incPageNavigation: "true",
      sort: "createdAt DESC",
      limit: String(PAGE_SIZE),
    });

    if (cursor) params.set("pageCursor", cursor);

    const url = `${baseUrl}/api/compose/namespace/${namespaceId}/module/${moduleId}/record/?${params}`;
    console.log(`  📄 [FETCH] Page ${page}: ${url.slice(0, 120)}...`);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const raw = await res.text();
    if (!res.ok) {
      throw new Error(
        `Record fetch failed (${res.status}): ${raw.slice(0, 200)}`,
      );
    }

    const json = JSON.parse(raw);
    const records = json.response?.set ?? [];
    allRecords.push(...records);

    // Corteza returns next cursor in response.filter.nextPage or pageNavigation
    const nav = json.response?.filter;
    cursor = nav?.nextPage || nav?.pageCursor || null;

    // Break if we got fewer records than the page size (last page)
    if (records.length < PAGE_SIZE) {
      cursor = null;
    }

    page++;
  } while (cursor);

  return allRecords;
}

/**
 * Convert Corteza [{name, value}] array to a flat object
 */
function flattenValues(valuesArray) {
  const obj = {};
  (valuesArray ?? []).forEach(({ name, value }) => {
    obj[name] = value;
  });
  return obj;
}
