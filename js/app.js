/* ═══════════════════════════════════════════════
   NPS Dashboard — Application Logic
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

  // ── Constants ──────────────────────────────
  const API_URL = "/api/nps";
  const REFRESH_INTERVAL = 5000; // 5 seconds
  const MONTH_ORDER = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // ── DOM refs ───────────────────────────────
  const $nps        = document.getElementById("metric-nps");
  const $npsSub     = document.getElementById("metric-nps-sub");
  const $avg        = document.getElementById("metric-avg");
  const $total      = document.getElementById("metric-total");
  const $promoters  = document.getElementById("metric-promoters");
  const $detractors = document.getElementById("metric-detractors");
  const $tableBody  = document.getElementById("table-body");
  const $filterYear    = document.getElementById("filter-year");
  const $filterMonth   = document.getElementById("filter-month");
  const $filterAccount = document.getElementById("filter-account");
  const $btnReset      = document.getElementById("btn-reset-filters");

  // ── Chart instances ────────────────────────
  let barChart   = null;
  let donutChart = null;

  // ── Raw data cache ─────────────────────────
  let rawRecords = [];

  // ══════════════════════════════════════════
  // Helpers
  // ══════════════════════════════════════════
  function classify(score) {
    const n = parseInt(score, 10);
    if (n >= 9) return "promoter";
    if (n >= 7) return "passive";
    return "detractor";
  }

  function monthIndex(name) {
    return MONTH_ORDER.indexOf(name);
  }

  // ══════════════════════════════════════════
  // Data fetching
  // ══════════════════════════════════════════
  async function fetchData() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rawRecords = await res.json();
      onDataUpdated();
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  // ══════════════════════════════════════════
  // Filtering
  // ══════════════════════════════════════════
  function getFilteredRecords() {
    const fy = $filterYear.value;
    const fm = $filterMonth.value;
    const fa = $filterAccount.value;
    return rawRecords.filter((r) => {
      const d = r.data;
      if (fy && d["Year"] !== fy) return false;
      if (fm && d["Month"] !== fm) return false;
      if (fa && d["Account Name"] !== fa) return false;
      return true;
    });
  }

  function populateFilters() {
    const years    = new Set();
    const months   = new Set();
    const accounts = new Set();

    rawRecords.forEach((r) => {
      const d = r.data;
      if (d["Year"])         years.add(d["Year"]);
      if (d["Month"])        months.add(d["Month"]);
      if (d["Account Name"]) accounts.add(d["Account Name"]);
    });

    syncSelect($filterYear,    [...years].sort(),    "All Years");
    syncSelect($filterMonth,   [...months].sort((a, b) => monthIndex(a) - monthIndex(b)), "All Months");
    syncSelect($filterAccount, [...accounts].sort(), "All Accounts");
  }

  function syncSelect(el, options, placeholder) {
    const current = el.value;
    el.innerHTML = `<option value="">${placeholder}</option>` +
      options.map((o) => `<option value="${o}"${o === current ? " selected" : ""}>${o}</option>`).join("");
  }

  // ══════════════════════════════════════════
  // Update everything after data changes
  // ══════════════════════════════════════════
  function onDataUpdated() {
    populateFilters();
    render();
  }

  function render() {
    const data = getFilteredRecords();
    updateMetrics(data);
    updateBarChart(data);
    updateDonutChart(data);
    updateTable(data);
  }

  // ══════════════════════════════════════════
  // Metrics
  // ══════════════════════════════════════════
  function updateMetrics(data) {
    const total = data.length;
    let promoters = 0, passives = 0, detractors = 0, scoreSum = 0;

    data.forEach((r) => {
      const s = parseInt(r.data["Score"], 10);
      scoreSum += s;
      const c = classify(s);
      if (c === "promoter")  promoters++;
      else if (c === "passive") passives++;
      else detractors++;
    });

    const pctP = total ? (promoters / total * 100) : 0;
    const pctD = total ? (detractors / total * 100) : 0;
    const nps  = Math.round(pctP - pctD);
    const avg  = total ? (scoreSum / total).toFixed(1) : "—";

    animateNumber($nps, nps);
    $npsSub.textContent = total ? `${pctP.toFixed(0)}% P – ${pctD.toFixed(0)}% D` : "";
    animateNumber($avg, avg);
    animateNumber($total, total);
    animateNumber($promoters, promoters);
    animateNumber($detractors, detractors);
  }

  function animateNumber(el, value) {
    el.textContent = value;
  }

  // ══════════════════════════════════════════
  // Bar Chart (Stacked by Month)
  // ══════════════════════════════════════════
  function updateBarChart(data) {
    // Group by month
    const grouped = {};
    data.forEach((r) => {
      const m = r.data["Month"];
      if (!grouped[m]) grouped[m] = { promoter: 0, passive: 0, detractor: 0 };
      grouped[m][classify(r.data["Score"])]++;
    });

    // Sort months
    const labels = Object.keys(grouped).sort((a, b) => monthIndex(a) - monthIndex(b));
    const promoters  = labels.map((l) => grouped[l].promoter);
    const passives   = labels.map((l) => grouped[l].passive);
    const detractors = labels.map((l) => grouped[l].detractor);

    const config = {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Promoters",  data: promoters,  backgroundColor: "rgba(74, 222, 128, 0.75)",  borderRadius: 4, borderSkipped: false },
          { label: "Passives",   data: passives,    backgroundColor: "rgba(251, 191, 36, 0.65)",  borderRadius: 4, borderSkipped: false },
          { label: "Detractors", data: detractors,  backgroundColor: "rgba(248, 113, 113, 0.75)", borderRadius: 4, borderSkipped: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: "#9aa0a8", font: { family: "'Inter',sans-serif", size: 12 }, padding: 18 } },
          tooltip: {
            backgroundColor: "rgba(17,19,25,0.92)",
            titleColor: "#e8eaed",
            bodyColor: "#9aa0a8",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#5f6672", font: { family: "'Inter',sans-serif", size: 11 } },
            grid: { color: "rgba(255,255,255,0.04)" }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: { color: "#5f6672", font: { family: "'Inter',sans-serif", size: 11 }, stepSize: 1 },
            grid: { color: "rgba(255,255,255,0.04)" }
          }
        }
      }
    };

    if (barChart) {
      barChart.data = config.data;
      barChart.update("none");
    } else {
      barChart = new Chart(document.getElementById("chart-bar"), config);
    }
  }

  // ══════════════════════════════════════════
  // Donut Chart (Overall Distribution)
  // ══════════════════════════════════════════
  function updateDonutChart(data) {
    let promoters = 0, passives = 0, detractors = 0;
    data.forEach((r) => {
      const c = classify(r.data["Score"]);
      if (c === "promoter") promoters++;
      else if (c === "passive") passives++;
      else detractors++;
    });

    const config = {
      type: "doughnut",
      data: {
        labels: ["Promoters", "Passives", "Detractors"],
        datasets: [{
          data: [promoters, passives, detractors],
          backgroundColor: ["rgba(74,222,128,0.8)", "rgba(251,191,36,0.7)", "rgba(248,113,113,0.8)"],
          borderColor: "#0b0e14",
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "68%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#9aa0a8", font: { family: "'Inter',sans-serif", size: 12 }, padding: 18 } },
          tooltip: {
            backgroundColor: "rgba(17,19,25,0.92)",
            titleColor: "#e8eaed",
            bodyColor: "#9aa0a8",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12
          }
        }
      }
    };

    if (donutChart) {
      donutChart.data = config.data;
      donutChart.update("none");
    } else {
      donutChart = new Chart(document.getElementById("chart-donut"), config);
    }
  }

  // ══════════════════════════════════════════
  // Table
  // ══════════════════════════════════════════
  function updateTable(data) {
    if (!data.length) {
      $tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px">No records found</td></tr>`;
      return;
    }

    $tableBody.innerHTML = data.map((r) => {
      const d = r.data;
      const score = parseInt(d["Score"], 10);
      const cat = classify(score);
      const statusClass = (d["Status"] || "").toLowerCase() === "active"
        ? "active"
        : (d["Status"] || "").toLowerCase() === "churned"
          ? "churned"
          : "default";

      return `<tr>
        <td>${escapeHtml(d["Account Name"])}</td>
        <td><span class="score-badge ${cat}">${score}</span></td>
        <td>${escapeHtml(d["Response"])}</td>
        <td>${escapeHtml(d["Month"])}</td>
        <td>${escapeHtml(d["Year"])}</td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(d["Status"])}</span></td>
      </tr>`;
    }).join("");
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ══════════════════════════════════════════
  // Event listeners
  // ══════════════════════════════════════════
  $filterYear.addEventListener("change", render);
  $filterMonth.addEventListener("change", render);
  $filterAccount.addEventListener("change", render);
  $btnReset.addEventListener("click", () => {
    $filterYear.value = "";
    $filterMonth.value = "";
    $filterAccount.value = "";
    render();
  });

  // ══════════════════════════════════════════
  // Init
  // ══════════════════════════════════════════
  fetchData();
  setInterval(fetchData, REFRESH_INTERVAL);

})();
