/* COS30045 Speeding Dashboard — Question-based version
   Uses:
     ../data/q1.csv  (jurisdiction totals by year)
     ../data/q2.csv  (enforcement type totals by year)
     ../data/q3.csv  (2024 age group totals)
     ../data/q4.csv  (2024 average fines by jurisdiction)
     ../data/q5.csv  (2024 age 0–16 totals by jurisdiction)
*/

const fmt = d3.format(",");

// ---------- Generic bar chart helper (for Q1 only now) ----------
function renderBarChart(config) {
  const {
    elId,
    data,
    xField,
    yField,
    xLabelRotate = 0,
    highlightKey = null,
    answerId = null,
    answerText = null,
    yLabel = "",
    valueFormat = (v) => fmt(v)
  } = config;

  const container = d3.select("#" + elId);
  if (container.empty()) return;

  container.selectAll("*").remove();

  const node = container.node();
  const width = (node && node.clientWidth) ? node.clientWidth : 600;
  const height = 280;
  const margin = { top: 24, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d[xField]))
    .range([0, innerW])
    .padding(0.2);

  const maxY = d3.max(data, d => d[yField]) || 0;
  const y = d3.scaleLinear()
    .domain([0, maxY * 1.1])
    .nice()
    .range([innerH, 0]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", `rotate(${xLabelRotate})`)
    .style("text-anchor", xLabelRotate ? "end" : "middle");

  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(valueFormat));

  if (yLabel) {
    g.append("text")
      .attr("x", -innerH / 2)
      .attr("y", -margin.left + 18)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#9fb0d8")
      .style("font-size", ".8rem")
      .text(yLabel);
  }

  // Bars
  const tooltip = createTooltip();

  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d[xField]))
    .attr("y", d => y(d[yField]))
    .attr("width", x.bandwidth())
    .attr("height", d => innerH - y(d[yField]))
    .attr("fill", d => {
      if (!highlightKey) return "#5b9dff";
      return d[xField] === highlightKey ? "#ffb74d" : "#5b9dff";
    })
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d[xField]}: <b>${valueFormat(d[yField])}</b>`
      );
    })
    .on("mouseleave", () => tooltip.hide());

  // Optional text answer
  if (answerId && answerText) {
    const el = document.getElementById(answerId);
    if (el) el.textContent = answerText;
  }
}

// Simple tooltip helper
function createTooltip() {
  let tip = d3.select(".tooltip");
  if (tip.empty()) {
    tip = d3.select("body").append("div").attr("class", "tooltip");
  }
  return {
    show: (evt, html) => {
      tip.html(html)
        .style("left", (evt.clientX + 12) + "px")
        .style("top", (evt.clientY + 12) + "px")
        .classed("show", true);
    },
    hide: () => tip.classed("show", false)
  };
}

// ---------- Q1: Which jurisdiction has the highest fine amount imposed? ----------
function drawQ1(rows) {
  if (!rows || !rows.length) return;

  const cols = Object.keys(rows[0]).filter(c => c !== "YEAR");

  const data = cols.map(col => {
    const total = d3.sum(rows, r => +r[col] || 0);
    const juris = col.split("+")[0]; // e.g. "NSW+Sum(FINES)" → "NSW"
    return { jurisdiction: juris, total };
  });

  data.sort((a, b) => b.total - a.total);
  const top = data[0];

  renderBarChart({
    elId: "q1Chart",
    data,
    xField: "jurisdiction",
    yField: "total",
    highlightKey: top ? top.jurisdiction : null,
    answerId: "q1Answer",
    answerText: top
      ? `Answer: ${top.jurisdiction} has the highest total speeding fines imposed (${fmt(top.total)} fines across all years).`
      : "Answer: Data not available.",
    yLabel: "Total fines (all years)",
    valueFormat: v => fmt(v)
  });
}

// ---------- Q2: Changes in enforcement measures (2023 vs 2024, camera vs police only) ----------
function drawQ2(rows) {
  if (!rows || !rows.length) return;

  rows.forEach(r => r.YEAR = +r.YEAR);

  const targetYears = [2023, 2024];
  const filtered = rows.filter(r => targetYears.includes(r.YEAR));

  const categories = [
    { key: "camera-issued fine+Sum(FINES)", label: "Camera-issued" },
    { key: "police-issued fine+Sum(FINES)", label: "Police-issued" }
  ];

  // Flattened data for grouped columns
  const data = [];
  filtered.forEach(row => {
    categories.forEach(cat => {
      const value = +row[cat.key] || 0;
      data.push({
        year: row.YEAR,
        type: cat.label,
        value
      });
    });
  });

  // Precompute 2023 vs 2024 differences for answer text
  const byYearType = {};
  data.forEach(d => {
    const k = `${d.type}-${d.year}`;
    byYearType[k] = d.value;
  });

  const parts = categories.map(cat => {
    const v23 = byYearType[`${cat.label}-2023`] || 0;
    const v24 = byYearType[`${cat.label}-2024`] || 0;
    const diff = v24 - v23;
    if (diff > 0) {
      return `${cat.label} increased by ${fmt(diff)} fines from 2023 to 2024`;
    } else if (diff < 0) {
      return `${cat.label} decreased by ${fmt(Math.abs(diff))} fines from 2023 to 2024`;
    }
    return `${cat.label} stayed about the same between 2023 and 2024`;
  });

  const answerText = "Answer: " + parts.join("; ") + ".";

  // ---- Draw grouped column chart ----
  const container = d3.select("#q2Chart");
  if (container.empty()) return;

  container.selectAll("*").remove();

  const node = container.node();
  const width = (node && node.clientWidth) ? node.clientWidth : 640;
  const height = 320;
  const margin = { top: 24, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const years = targetYears;
  const types = categories.map(c => c.label);

  const x0 = d3.scaleBand()
    .domain(years)
    .range([0, innerW])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(types)
    .range([0, x0.bandwidth()])
    .padding(0.1);

  const maxY = d3.max(data, d => d.value) || 0;
  const y = d3.scaleLinear()
    .domain([0, maxY * 1.1])
    .nice()
    .range([innerH, 0]);

  const color = d3.scaleOrdinal()
    .domain(types)
    .range(["#5b9dff", "#ffb74d"]);

  const tooltip = createTooltip();

  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x0).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(v => fmt(v)));

  g.append("text")
    .attr("x", -innerH / 2)
    .attr("y", -margin.left + 18)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#9fb0d8")
    .style("font-size", ".8rem")
    .text("Number of fines");

  const yearGroups = g.selectAll(".year-group")
    .data(years)
    .enter()
    .append("g")
    .attr("class", "year-group")
    .attr("transform", d => `translate(${x0(d)},0)`);

  yearGroups.selectAll("rect")
    .data(year => data.filter(d => d.year === year))
    .enter()
    .append("rect")
    .attr("x", d => x1(d.type))
    .attr("y", d => y(d.value))
    .attr("width", x1.bandwidth())
    .attr("height", d => innerH - y(d.value))
    .attr("fill", d => color(d.type))
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d.year} — ${d.type}: <b>${fmt(d.value)}</b> fines`
      );
    })
    .on("mouseleave", () => tooltip.hide());

  // Legend
  const legend = g.append("g")
    .attr("transform", `translate(${innerW - 150}, 0)`);

  types.forEach((t, i) => {
    const lg = legend.append("g")
      .attr("transform", `translate(0, ${i * 18})`);
    lg.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(t));
    lg.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .style("font-size", ".75rem")
      .attr("fill", "#dfe8ff")
      .text(t);
  });

  const el = document.getElementById("q2Answer");
  if (el) el.textContent = answerText;
}

// ---------- Q3: Age group with most records in 2024 (pie chart) ----------
function drawQ3(rows) {
  if (!rows || !rows.length) return;

  const data = rows.map(r => ({
    age: r.AGE_GROUP,
    fines: +r["Sum(FINES)"] || 0
  }));

  data.sort((a, b) => b.fines - a.fines);
  const top = data[0];

  const container = d3.select("#q3Chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const node = container.node();
  const width = (node && node.clientWidth) ? node.clientWidth : 500;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 20;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.age))
    .range(d3.schemeSet2);

  const pie = d3.pie()
    .value(d => d.fines)
    .sort(null);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const tooltip = createTooltip();

  const arcs = g.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.age))
    .attr("stroke", "#111827")
    .attr("stroke-width", 1)
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d.data.age}: <b>${fmt(d.data.fines)}</b> fines`
      );
    })
    .on("mouseleave", () => tooltip.hide());

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(10,10)`);

  data.forEach((d, i) => {
    const lg = legend.append("g")
      .attr("transform", `translate(0, ${i * 18})`);
    lg.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(d.age));
    lg.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .style("font-size", ".75rem")
      .attr("fill", "#dfe8ff")
      .text(d.age);
  });

  const answerEl = document.getElementById("q3Answer");
  if (answerEl && top) {
    answerEl.textContent =
      `Answer: The ${top.age} age group has the most speeding fine records in 2024 (${fmt(top.fines)} fines).`;
  } else if (answerEl) {
    answerEl.textContent = "Answer: Data not available.";
  }
}

// ---------- Q4: States with highest average fine amounts in 2024 (area chart) ----------
function drawQ4(rows) {
  if (!rows || !rows.length) return;

  const data = rows.map(r => ({
    jurisdiction: r.JURISDICTION,
    meanFine: +r["Mean(FINES)"] || 0
  }));

  // Sort by jurisdiction name or by meanFine; here we sort alphabetically for a smoother x-axis
  data.sort((a, b) => d3.ascending(a.jurisdiction, b.jurisdiction));

  const top = [...data].sort((a, b) => b.meanFine - a.meanFine)[0];
  const top3 = [...data].sort((a, b) => b.meanFine - a.meanFine).slice(0, 3);

  const topList = top3.map(d =>
    `${d.jurisdiction} (${d.meanFine.toFixed(2)})`
  ).join(", ");

  const answerText = top
    ? `Answer: ${top.jurisdiction} has the highest average fine amount in 2024 (${top.meanFine.toFixed(2)}). Top states by average fine are: ${topList}.`
    : "Answer: Data not available.";

  const container = d3.select("#q4Chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const node = container.node();
  const width = (node && node.clientWidth) ? node.clientWidth : 640;
  const height = 320;
  const margin = { top: 24, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(data.map(d => d.jurisdiction))
    .range([0, innerW])
    .padding(0.5);

  const maxY = d3.max(data, d => d.meanFine) || 0;
  const y = d3.scaleLinear()
    .domain([0, maxY * 1.1])
    .nice()
    .range([innerH, 0]);

  const area = d3.area()
    .x(d => x(d.jurisdiction))
    .y0(innerH)
    .y1(d => y(d.meanFine))
    .curve(d3.curveMonotoneX);

  const line = d3.line()
    .x(d => x(d.jurisdiction))
    .y(d => y(d.meanFine))
    .curve(d3.curveMonotoneX);

  const tooltip = createTooltip();

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(v => v.toFixed(2)));

  g.append("text")
    .attr("x", -innerH / 2)
    .attr("y", -margin.left + 18)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#9fb0d8")
    .style("font-size", ".8rem")
    .text("Average fine amount in 2024");

  // Area
  g.append("path")
    .datum(data)
    .attr("fill", "#5b9dff")
    .attr("opacity", 0.35)
    .attr("d", area);

  // Line
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#5b9dff")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Points
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.jurisdiction))
    .attr("cy", d => y(d.meanFine))
    .attr("r", d => d.jurisdiction === top.jurisdiction ? 5 : 3)
    .attr("fill", d => d.jurisdiction === top.jurisdiction ? "#ffb74d" : "#1f2937")
    .attr("stroke", "#5b9dff")
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d.jurisdiction}: <b>${d.meanFine.toFixed(2)}</b>`
      );
    })
    .on("mouseleave", () => tooltip.hide());

  const el = document.getElementById("q4Answer");
  if (el) el.textContent = answerText;
}

// ---------- Q5: 0–16 age group, most records by state in 2024 (line chart) ----------
function drawQ5(rows) {
  if (!rows || !rows.length) return;

  const data = rows.map(r => ({
    jurisdiction: r.JURISDICTION,
    fines: +r["Sum(FINES)"] || 0
  }));

  // Sort by jurisdiction for line ordering
  data.sort((a, b) => d3.ascending(a.jurisdiction, b.jurisdiction));

  const top = [...data].sort((a, b) => b.fines - a.fines)[0];

  const container = d3.select("#q5Chart");
  if (container.empty()) return;
  container.selectAll("*").remove();

  const node = container.node();
  const width = (node && node.clientWidth) ? node.clientWidth : 640;
  const height = 320;
  const margin = { top: 24, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(data.map(d => d.jurisdiction))
    .range([0, innerW])
    .padding(0.5);

  const maxY = d3.max(data, d => d.fines) || 0;
  const y = d3.scaleLinear()
    .domain([0, maxY * 1.1])
    .nice()
    .range([innerH, 0]);

  const line = d3.line()
    .x(d => x(d.jurisdiction))
    .y(d => y(d.fines))
    .curve(d3.curveMonotoneX);

  const tooltip = createTooltip();

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(v => fmt(v)));

  g.append("text")
    .attr("x", -innerH / 2)
    .attr("y", -margin.left + 18)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#9fb0d8")
    .style("font-size", ".8rem")
    .text("Fines in 2024 (age 0–16)");

  // Line
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#5b9dff")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Points
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.jurisdiction))
    .attr("cy", d => y(d.fines))
    .attr("r", d => d.jurisdiction === top.jurisdiction ? 5 : 3)
    .attr("fill", d => d.jurisdiction === top.jurisdiction ? "#ffb74d" : "#1f2937")
    .attr("stroke", "#5b9dff")
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d.jurisdiction}: <b>${fmt(d.fines)}</b> fines`
      );
    })
    .on("mouseleave", () => tooltip.hide());

  const el = document.getElementById("q5Answer");
  if (el) {
    el.textContent = top
      ? `Answer: ${top.jurisdiction} has the most speeding fine records for the 0–16 age group in 2024 (${fmt(top.fines)} fines).`
      : "Answer: Data not available.";
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  d3.csv("../data/q1.csv").then(drawQ1);
  d3.csv("../data/q2.csv").then(drawQ2);
  d3.csv("../data/q3.csv").then(drawQ3);
  d3.csv("../data/q4.csv").then(drawQ4);
  d3.csv("../data/q5.csv").then(drawQ5);
});
