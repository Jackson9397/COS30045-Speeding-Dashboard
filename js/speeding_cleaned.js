
(function () {
  const DATA_DIR = "data/";

  // --- Utility helpers -------------------------------------------------------
  const pick = (obj, candidates) => {
    // return first existing key (case/space/underscore-insensitive)
    if (!obj) return undefined;
    const normMap = new Map(
      Object.keys(obj).map(k => [k.toLowerCase().replace(/[ _]/g, ""), k])
    );
    for (const c of candidates) {
      const key = normMap.get(c.toLowerCase().replace(/[ _]/g, ""));
      if (key != null) return obj[key];
    }
    return undefined;
  };

  const toNumber = (v) => {
    if (v == null || v === "") return 0;
    const n = +String(v).replace(/[, ]+/g, "");
    return Number.isFinite(n) ? n : 0;
  };

  // Normalise jurisdiction names to match GeoJSON and charts
  const JURIS_MAP = new Map([
    ["australian capital territory", "Australian Capital Territory"],
    ["act", "Australian Capital Territory"],
    ["new south wales", "New South Wales"],
    ["nsw", "New South Wales"],
    ["victoria", "Victoria"],
    ["vic", "Victoria"],
    ["queensland", "Queensland"],
    ["qld", "Queensland"],
    ["south australia", "South Australia"],
    ["sa", "South Australia"],
    ["western australia", "Western Australia"],
    ["wa", "Western Australia"],
    ["tasmania", "Tasmania"],
    ["tas", "Tasmania"],
    ["northern territory", "Northern Territory"],
    ["nt", "Northern Territory"]
  ]);

  const normJur = (s) => {
    if (!s) return "Unknown";
    const k = String(s).trim().toLowerCase();
    return JURIS_MAP.get(k) || s;
  };

  const normMethod = (s) => {
    if (!s) return "Unknown";
    const t = String(s).toLowerCase();
    if (t.includes("camera")) return "Camera";
    if (t.includes("police") || t.includes("officer") || t.includes("ots")) return "Police";
    return s;
  };

  const isSpeedingRow = (row) => {
    const offence = pick(row, ["Offence Type", "Offence", "OffenceType", "Category"]);
    if (!offence) return true; // some fines files are already separated; keep
    return String(offence).toLowerCase().includes("speed");
  };

  // --- CSV loader (d3 required) ---------------------------------------------
  async function loadCSV(filename) {
    if (typeof d3 === "undefined") {
      throw new Error("d3.js is required. Make sure to include d3 before speeding_cleaned.js");
    }
    return d3.csv(`${DATA_DIR}${filename}`);
  }

  // --- Main cleaning/aggregation --------------------------------------------
  async function buildCleaned() {
    // fines is the main source for speeding
    const finesRaw = await loadCSV("police_enforcement_2024_fines.csv")
      .catch(() => []); 

    // Parse & filter
    const parsed = [];
    for (const row of finesRaw) {
      if (!isSpeedingRow(row)) continue;

      const year = +pick(row, ["Year"]);
      if (!year || !Number.isFinite(year)) continue;

      const jurisdiction = normJur(pick(row, ["Jurisdiction", "State", "Territory"]));
      const method = normMethod(pick(row, ["Detection Method", "DetectionMethod", "Method"])) || "All";

      const fines = toNumber(pick(row, ["Fines", "Fine", "Count", "Infringements"]));
      const licences = toNumber(pick(row, ["Licences", "Licenses", "Licence Count", "License Count"]));
      const population = toNumber(pick(row, ["Population", "Pop"]));

      parsed.push({ year, jurisdiction, method, fines, licences, population });
    }

    // Aggregate by Year/Jurisdiction/Method
    const keyYJM = d => `${d.year}|${d.jurisdiction}|${d.method}`;
    const aggMap = new Map();
    for (const r of parsed) {
      const k = keyYJM(r);
      const cur = aggMap.get(k) || { year: r.year, jurisdiction: r.jurisdiction, method: r.method, fines: 0, licences: 0, population: 0 };
      cur.fines += r.fines;
      cur.licences += r.licences;
      cur.population += r.population;
      aggMap.set(k, cur);
    }
    const records = Array.from(aggMap.values());

    // Compute rate per 10k
    for (const r of records) {
      const denom = r.licences > 0 ? r.licences : (r.population > 0 ? r.population : null);
      r.ratePer10k = denom ? (r.fines / denom) * 10000 : null;
    }

    // Derived collections
    const years = Array.from(new Set(records.map(d => d.year))).sort((a, b) => a - b);
    const jurisdictions = Array.from(new Set(records.map(d => d.jurisdiction))).sort();
    const methods = Array.from(new Set(records.map(d => d.method))).sort();
    const byJurYear = d3.rollup(
      records,
      v => ({
        fines: d3.sum(v, d => d.fines),
        ratePer10k: (function () {
          const fines = d3.sum(v, d => d.fines);
          const lic = d3.sum(v, d => d.licences);
          const pop = d3.sum(v, d => d.population);
          const denom = lic > 0 ? lic : (pop > 0 ? pop : null);
          return denom ? (fines / denom) * 10000 : null;
        })()
      }),
      d => d.jurisdiction,
      d => d.year
    );

    const byJur = d3.rollup(
      records,
      v => ({
        fines: d3.sum(v, d => d.fines),
        ratePer10k: (function () {
          const fines = d3.sum(v, d => d.fines);
          const lic = d3.sum(v, d => d.licences);
          const pop = d3.sum(v, d => d.population);
          const denom = lic > 0 ? lic : (pop > 0 ? pop : null);
          return denom ? (fines / denom) * 10000 : null;
        })()
      }),
      d => d.jurisdiction
    );

    const totals = {
      fines: d3.sum(records, d => d.fines),
      years: years.length,
      jurisdictions: jurisdictions.length
    };

    return { records, years, jurisdictions, methods, byJurYear, byJur, totals };
  }

  // --- Public API ------------------------------------------------------------
  const api = {
    ready: null,
    getSeries(jurisdiction, method) {
      if (!api._cache) return [];
      const rows = api._cache.records.filter(d =>
        d.jurisdiction === jurisdiction && (method ? d.method === method : true)
      );
      const byYear = d3.rollups(rows, v => ({
        fines: d3.sum(v, d => d.fines),
        ratePer10k: (function () {
          const fines = d3.sum(v, d => d.fines);
          const lic = d3.sum(v, d => d.licences);
          const pop = d3.sum(v, d => d.population);
          const denom = lic > 0 ? lic : (pop > 0 ? pop : null);
          return denom ? (fines / denom) * 10000 : null;
        })()
      }), d => d.year).map(([year, x]) => ({ year, fines: x.fines, ratePer10k: x.ratePer10k }))
        .sort((a, b) => a.year - b.year);
      return byYear;
    },
    getMapYear(year, method) {
      if (!api._cache) return [];
      const rows = api._cache.records.filter(d =>
        d.year === year && (method ? d.method === method : true)
      );
      const byJur = d3.rollups(rows, v => ({
        fines: d3.sum(v, d => d.fines),
        ratePer10k: (function () {
          const fines = d3.sum(v, d => d.fines);
          const lic = d3.sum(v, d => d.licences);
          const pop = d3.sum(v, d => d.population);
          const denom = lic > 0 ? lic : (pop > 0 ? pop : null);
          return denom ? (fines / denom) * 10000 : null;
        })()
      }), d => d.jurisdiction).map(([jurisdiction, x]) => ({
        jurisdiction, fines: x.fines, ratePer10k: x.ratePer10k
      }));
      return byJur;
    }
  };

  // Build immediately, expose global & dispatch event
  api.ready = buildCleaned().then(payload => {
    api._cache = payload;
    window.SpeedingData = api;
    const evt = new CustomEvent("data:ready", { detail: payload });
    window.dispatchEvent(evt);
    return payload;
  }).catch(err => {
    console.error("[SpeedingData] failed:", err);
    window.SpeedingData = api;
    return { records: [], years: [], jurisdictions: [], methods: [] };
  });

  // expose
  window.SpeedingData = api;
})();
