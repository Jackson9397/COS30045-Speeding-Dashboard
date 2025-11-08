/* COS30045 Speeding Dashboard — D3 v7
   Loads:
     ../data/police_enforcement_2024_fines.csv
     ../js/aus_states.geojson
   Draws: Line (national), Area (jurisdiction), Choropleth (by jurisdiction)
*/

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const fmt = d3.format(",");
const yearParse = (v) => +String(v).match(/\d{4}/)?.[0] || null;

function normKey(s) { return String(s || "").trim().toLowerCase(); }

// Map DETECTION_METHOD values to buckets: "police" | "camera" | "other"
function normaliseDetection(raw) {
  const s = String(raw || "").trim().toLowerCase();

  // POLICE
  if (s === "police issued" || s.includes("police issued")) return "police";

  // CAMERA (any camera flavour)
  // catches: average speed camera, fixed camera, fixed or mobile camera,
  // mobile camera, red light camera, speed camera, etc.
  if (s.includes("camera")) return "camera";

  // OTHER family (unknown / not applicable / other / blanks)
  if (
    !s ||
    s === "other" ||
    s === "unknown" ||
    s === "not applicable" ||
    s === "n/a" ||
    s === "na"
  ) return "other";

  // Fallback
  return "other";
}

function coerceRow(row) {
  // Make column name access resilient
  const keyMap = {};
  for (const k of Object.keys(row)) keyMap[normKey(k)] = k;

  const yearK = keyMap["year"] || keyMap["start date"] || keyMap["date"] || Object.keys(row)[0];
  const jurisK =
    keyMap["jurisdiction"] ||
    keyMap["state"] ||
    keyMap["state/territory"] ||
    keyMap["jurisdiction (state/territory)"];
  const detK = keyMap["detection method"] || keyMap["detection_method"] || keyMap["method"];
  const offenceK = keyMap["offence type"] || keyMap["offence"] || null;
  const finesK = keyMap["fines"] || keyMap["count"] || keyMap["value"];

  const year = yearParse(row[yearK]);
  const rawJ = String(row[jurisK] ?? "").toUpperCase();
  const jurisdiction = rawJ
    .replace("AUSTRALIAN CAPITAL TERRITORY", "ACT")
    .replace("NEW SOUTH WALES", "NSW")
    .replace("NORTHERN TERRITORY", "NT")
    .replace("QUEENSLAND", "QLD")
    .replace("SOUTH AUSTRALIA", "SA")
    .replace("TASMANIA", "TAS")
    .replace("VICTORIA", "VIC")
    .replace("WESTERN AUSTRALIA", "WA");
  const detectionRaw = detK ? row[detK] : "";
  const detection = normaliseDetection(detectionRaw);
  const offence = offenceK ? String(row[offenceK]).toLowerCase() : "";
  const fines = +row[finesK] || 0;

  return { year, jurisdiction, detection, offence, fines };
}

function isSpeeding(rec) {
  // If an offence column exists, keep "speeding" only; otherwise accept the row.
  return !rec.offence || rec.offence.includes("speed");
}

// ---------- App State ----------
const state = {
  data: [],
  years: [],
  jurisdictions: [],
  selectedJurisdiction: null,
  selectedYear: null,
  selectedMethod: "ALL", // ALL | POLICE | CAMERA | OTHER (case-insensitive)
  geo: null
};

// ---------- Init ----------
(async function init () {
  try {
    const fines = await d3.csv("../data/police_enforcement_2024_fines.csv", coerceRow);

    state.data = fines.filter(isSpeeding).filter(d => d.year >= 2008 && d.year <= 2024);

    state.years = Array.from(new Set(state.data.map(d => d.year))).sort((a, b) => a - b);
    state.jurisdictions = Array.from(new Set(state.data.map(d => d.jurisdiction))).sort();

    state.selectedJurisdiction = state.jurisdictions.includes("VIC") ? "VIC" : state.jurisdictions[0];
    state.selectedYear = d3.max(state.years);

    // Populate selects
    const jurSel = $("#jurisdictionSel");
    if (jurSel) {
      jurSel.innerHTML = state.jurisdictions.map(j => `<option value="${j}">${j}</option>`).join("");
      jurSel.value = state.selectedJurisdiction;
      jurSel.addEventListener("change", (e) => {
        state.selectedJurisdiction = e.target.value;
        drawArea();
      });
    }

    const yearSel = $("#yearSel");
    if (yearSel) {
      yearSel.innerHTML = state.years.map(y =>
        `<option value="${y}" ${y === state.selectedYear ? "selected" : ""}>${y}</option>`
      ).join("");
      yearSel.addEventListener("change", (e) => {
        state.selectedYear = +e.target.value;
        const yLbl = $("#mapYearLbl");
        if (yLbl) yLbl.textContent = state.selectedYear;
        drawMap();
      });
    }

    const detectSel = $("#detectSel");
    if (detectSel) {
      const opts = [
        { v: "ALL", label: "All" },
        { v: "POLICE", label: "Police-issued" },
        { v: "CAMERA", label: "Camera" },
        { v: "OTHER", label: "Other" }
      ];
      detectSel.innerHTML = opts.map(o => `<option value="${o.v}">${o.label}</option>`).join("");
      detectSel.value = state.selectedMethod;
      detectSel.addEventListener("change", (e) => {
        state.selectedMethod = e.target.value;
        redrawAll();
      });
    }

    try {
      state.geo = await d3.json("../js/aus_states.geojson");
    } catch (e) {
      console.warn("Could not load ../js/aus_states.geojson. Check path/name.", e);
    }

    drawLine();
    drawArea();
    drawMap();

    window.addEventListener("resize", () => {
      drawLine(true);
      drawArea(true);
      drawMap(true);
    });
  } catch (err) {
    console.error("Initialisation error:", err);
  }
})();

// ---------- Filtering by Detection ----------
function filterByMethod (rows, method) {
  // Accept values: "ALL" | "POLICE" | "CAMERA" | "OTHER" (and tolerant aliases)
  const m = String(method || "ALL").trim().toLowerCase();
  if (m === "all") return rows;

  const isPolice = (d) => d.detection === "police";
  const isCamera = (d) => d.detection === "camera";
  const isOther  = (d) => d.detection === "other";

  const policeKeys = ["police", "police-issued", "police issued", "officer", "patrol", "ots", "on-the-spot", "on the spot"];
  const cameraKeys = ["camera", "mobile camera", "fixed camera", "average speed", "red light", "speed camera"];
  const otherKeys  = ["other", "unknown", "not applicable", "n/a", "na"];

  if (policeKeys.some(k => m.includes(k))) return rows.filter(isPolice);
  if (cameraKeys.some(k => m.includes(k))) return rows.filter(isCamera);
  if (otherKeys.some(k => m.includes(k)))  return rows.filter(isOther);

  // Also allow strict tokens "police"|"camera"|"other"
  if (m === "police") return rows.filter(isPolice);
  if (m === "camera") return rows.filter(isCamera);
  if (m === "other")  return rows.filter(isOther);

  // Unknown value → do not filter
  return rows;
}

// ---------- Line Chart (National) ----------
function drawLine () {
  const el = d3.select("#lineChart");
  if (el.empty()) return;

  el.selectAll("*").remove();

  const w = el.node().clientWidth || 600;
  const h = el.node().clientHeight || 300;
  const m = { t: 24, r: 20, b: 40, l: 60 };
  const innerW = w - m.l - m.r;
  const innerH = h - m.t - m.b;

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

  const filtered = filterByMethod(state.data, state.selectedMethod);
  const totals = d3.rollups(filtered, v => d3.sum(v, d => d.fines), d => d.year)
                   .sort((a, b) => a[0] - b[0]);

  const x = d3.scaleLinear().domain(d3.extent(state.years)).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, d3.max(totals, d => d[1]) * 1.08]).nice()
               .range([innerH, 0]);

  g.append("g").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d"))).attr("class", "axis");
  g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => fmt(d))).attr("class", "axis");

  const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX);

  // gradient + path
  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "lineGrad").attr("x1", "0%").attr("x2", "100%");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#7ef0d1");
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#5b9dff");

  const path = g.append("path")
    .datum(totals)
    .attr("fill", "none")
    .attr("stroke", "url(#lineGrad)")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  // draw points (for click targets on mobile) + tooltip on hover
  const tip = createTooltip();
  g.selectAll(".pt").data(totals).enter().append("circle")
    .attr("class", "pt").attr("r", 3.5)
    .attr("cx", d => x(d[0])).attr("cy", d => y(d[1]))
    .style("fill", "#7ef0d1")
    .on("mouseenter", (e, d) => tip.show(e, `${d[0]}: <b>${fmt(d[1])}</b> fines`))
    .on("mouseleave", () => tip.hide());

  // ---- focus that follows the mouse ----
  const focus = g.append("g").attr("class", "focus").style("display", "none");
  focus.append("circle").attr("r", 5).attr("fill", "#fff").attr("stroke", "#5b9dff");
  focus.append("text").attr("x", 9).attr("dy", "-0.7em")
       .attr("fill", "#dfe8ff").style("font-size", "0.85rem");

  const bisect = d3.bisector(d => d[0]).center;

  svg.append("rect")
    .attr("class", "overlay")
    .attr("fill", "transparent")
    .attr("pointer-events", "all")
    .attr("x", m.l).attr("y", m.t)
    .attr("width", innerW).attr("height", innerH)
    .on("mouseenter", () => {
      focus.style("display", null);
      path.attr("stroke-width", 3.5).attr("stroke", "#6fc1ff");
    })
    .on("mouseleave", () => {
      focus.style("display", "none");
      path.attr("stroke-width", 2.5).attr("stroke", "url(#lineGrad)");
      tip.hide();
    })
    .on("mousemove", function (event) {
      const xm = d3.pointer(event, this)[0] - m.l;
      const xYear = Math.round(x.invert(xm));
      const idx = Math.max(0, Math.min(totals.length - 1, bisect(totals, xYear)));
      const d = totals[idx];

      focus.attr("transform", `translate(${x(d[0])},${y(d[1])})`);
      focus.select("text").text(`${d[0]} • ${fmt(d[1])}`);

      tip.show(event, `${d[0]}: <b>${fmt(d[1])}</b> fines`);
    });
}


// ---------- Area Chart (Selected Jurisdiction) ----------
function drawArea () {
  const el = d3.select("#areaChart");
  if (el.empty()) return;

  el.selectAll("*").remove();

  const w = el.node().clientWidth || 600;
  const h = el.node().clientHeight || 300;
  const m = { t: 24, r: 20, b: 40, l: 60 };
  const innerW = w - m.l - m.r;
  const innerH = h - m.t - m.b;

  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

  const filtered = filterByMethod(
    state.data.filter(d => d.jurisdiction === state.selectedJurisdiction),
    state.selectedMethod
  );
  const series = d3.rollups(filtered, v => d3.sum(v, d => d.fines), d => d.year).sort((a, b) => a[0] - b[0]);

  const x = d3.scaleLinear().domain(d3.extent(state.years)).range([0, innerW]);
  const y = d3.scaleLinear().domain([0, d3.max(series, d => d[1]) * 1.15]).nice().range([innerH, 0]);

  g.append("g").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d"))).attr("class", "axis");
  g.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(d => fmt(d))).attr("class", "axis");

  const area = d3.area().x(d => x(d[0])).y0(innerH).y1(d => y(d[1])).curve(d3.curveMonotoneX);

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "areaGrad").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
  grad.append("stop").attr("offset", "0%").attr("stop-color", "#5b9dff").attr("stop-opacity", 0.9);
  grad.append("stop").attr("offset", "100%").attr("stop-color", "#5b9dff").attr("stop-opacity", 0.1);

  const areaPath = g.append("path")
    .datum(series)
    .attr("fill", "url(#areaGrad)")
    .attr("d", area)
    .attr("opacity", 1);

  // a thin outline line to improve focus visibility
  const outline = g.append("path")
    .datum(series)
    .attr("fill", "none")
    .attr("stroke", "#5b9dff")
    .attr("stroke-width", 1.2)
    .attr("d", d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX));

  g.append("text")
    .attr("x", innerW)
    .attr("y", -6)
    .attr("text-anchor", "end")
    .attr("fill", "#9fb0d8")
    .style("font-size", ".95rem")
    .text(state.selectedJurisdiction);

  // ---- focus + hover highlight ----
  const tip = createTooltip();

  const focus = g.append("g").attr("class", "focus").style("display", "none");
  focus.append("circle").attr("r", 5).attr("fill", "#fff").attr("stroke", "#5b9dff");
  focus.append("text").attr("x", 9).attr("dy", "-0.7em")
       .attr("fill", "#dfe8ff").style("font-size", "0.85rem");

  const bisect = d3.bisector(d => d[0]).center;

  svg.append("rect")
    .attr("class", "overlay")
    .attr("fill", "transparent")
    .attr("pointer-events", "all")
    .attr("x", m.l).attr("y", m.t)
    .attr("width", innerW).attr("height", innerH)
    .on("mouseenter", () => {
      focus.style("display", null);
      areaPath.attr("opacity", 0.95);
      outline.attr("stroke-width", 2).attr("stroke", "#6fc1ff");
    })
    .on("mouseleave", () => {
      focus.style("display", "none");
      areaPath.attr("opacity", 1);
      outline.attr("stroke-width", 1.2).attr("stroke", "#5b9dff");
      tip.hide();
    })
    .on("mousemove", function (event) {
      const xm = d3.pointer(event, this)[0] - m.l;
      const xYear = Math.round(x.invert(xm));
      const idx = Math.max(0, Math.min(series.length - 1, bisect(series, xYear)));
      const d = series[idx];

      focus.attr("transform", `translate(${x(d[0])},${y(d[1])})`);
      focus.select("text").text(`${d[0]} • ${fmt(d[1])}`);

      tip.show(event, `${state.selectedJurisdiction} — ${d[0]}: <b>${fmt(d[1])}</b> fines`);
    });
}


// ---------- Map (Choropleth) ----------
function drawMap(){
  const el = d3.select("#map");
  if (el.empty() || !state.geo) return;

  el.selectAll("*").remove();

  const w = el.node().clientWidth || 640, h = el.node().clientHeight || 420;
  const svg = el.append("svg").attr("width", w).attr("height", h);
  const g = svg.append("g");

  const projection = d3.geoMercator().fitSize([w, h-10], state.geo);
  const path = d3.geoPath(projection);

  const data = filterByMethod(state.data.filter(d=>d.year===state.selectedYear), state.selectedMethod);
  const byJ = d3.rollup(data, v=>d3.sum(v,d=>d.fines), d=>d.jurisdiction);

  const values = Array.from(byJ.values());
  const domain = values.length ? [d3.min(values), d3.max(values)] : [0,1];
  const color = d3.scaleQuantize().domain(domain).range(d3.schemeBlues[7].slice(1));

  const tip = createTooltip();

  g.selectAll("path.state")
    .data(state.geo.features)
    .enter().append("path")
    .attr("class","state")
    .attr("d", path)
    .attr("fill", d => {
      const key = extractGeoKey(d);
      const v = byJ.get(key) || 0;
      return v ? color(v) : "#1c254f";
    })
    .attr("stroke","rgba(255,255,255,.25)")
    .attr("stroke-width",1)
    .on("mousemove",(e,d)=> {
      const key = extractGeoKey(d);
      const v = byJ.get(key) || 0;
      tip.show(e, `${key} — <b>${fmt(v)}</b> fines`);
    })
    .on("mouseleave",()=> tip.hide())
    .on("click",(e,d)=>{
      const key = extractGeoKey(d);
      if (state.jurisdictions.includes(key) && key !== state.selectedJurisdiction) {
        state.selectedJurisdiction = key;
        const sel = $("#jurisdictionSel"); if (sel) sel.value = key;
        drawArea();
      }
    });

  // Legend
  const legend = d3.select("#mapLegend").html("");
  const row = legend.append("div").attr("class","row");
  color.range().forEach(c=> row.append("span").attr("class","swatch").style("background",c));
  legend.append("span").text("Fewer  →  More fines");

  // Year label
  const yr = $("#mapYearLbl");
  if (yr) yr.textContent = state.selectedYear;
}

function extractGeoKey(d){
  const props = d.properties || {};
  // Rowan Hogan geojson typically has STATE_NAME, sometimes STATE_CODE
  const code = String(props.STATE_CODE || "").toUpperCase();
  const name = String(props.STATE_NAME || "").toUpperCase();
  const map = {
    "AUSTRALIAN CAPITAL TERRITORY":"ACT","NEW SOUTH WALES":"NSW","NORTHERN TERRITORY":"NT",
    "QUEENSLAND":"QLD","SOUTH AUSTRALIA":"SA","TASMANIA":"TAS","VICTORIA":"VIC","WESTERN AUSTRALIA":"WA"
  };
  if (["ACT","NSW","NT","QLD","SA","TAS","VIC","WA"].includes(code)) return code;
  if (name && map[name]) return map[name];
  return code || map[name] || name || "NA";
}

// ---------- Tooltip ----------
function createTooltip(){
  let tip = d3.select(".tooltip");
  if (tip.empty()){
    tip = d3.select("body").append("div").attr("class","tooltip");
  }
  return {
    show: (evt, html) => {
      tip.html(html)
        .style("left", (evt.clientX + 12) + "px")
        .style("top",  (evt.clientY + 12) + "px")
        .classed("show", true);
    },
    hide: () => tip.classed("show", false)
  };
}

// ---------- Redraw ----------
function redrawAll(){
  drawLine();
  drawArea();
  drawMap();
}
