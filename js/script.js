/* COS30045 Speeding Dashboard — No text answers anywhere */

const fmt = d3.format(",");

// ---------- Tooltip ----------
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

// ---------- Generic Bar Component (Q1) ----------
function renderBarChart(config) {
  const {
    elId, data,
    xField, yField,
    highlightKey = null,
    xLabelRotate = 0,
    yLabel = "",
    valueFormat = fmt
  } = config;

  const container = d3.select("#" + elId);
  if (container.empty()) return;

  container.selectAll("*").remove();
  const node = container.node();

  const width = node.clientWidth || 600;
  const height = 280;

  const margin = { top: 24, right: 20, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width).attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d[xField]))
    .range([0, innerW])
    .padding(0.2);

  const maxY = d3.max(data, d => d[yField]) || 0;
  const y = d3.scaleLinear()
    .domain([0, maxY * 1.1]).nice()
    .range([innerH, 0]);

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
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -margin.left + 18)
      .attr("text-anchor", "middle")
      .text(yLabel);
  }

  const tooltip = createTooltip();

  // Bars
  g.selectAll("rect.bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", d =>
      "bar " + (d[xField] === highlightKey ? "bar-highlight" : "bar-default")
    )
    .attr("x", d => x(d[xField]))
    .attr("y", d => y(d[yField]))
    .attr("width", x.bandwidth())
    .attr("height", d => innerH - y(d[yField]));

  // Value labels at top of each bar (Q1)
      g.selectAll("text.bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d[xField]) + x.bandwidth() / 2)  
    .attr("y", d => y(d[yField]) - 10)                  
    .attr("text-anchor", "middle")
    .style("text-anchor", "middle")                     
    .style("dominant-baseline", "central")              
    .text(d => valueFormat(d[yField]));


  // Hover guideline + overlay
  const hoverLine = g.append("line")
    .attr("class", "hover-line")
    .attr("y1", 0)
    .attr("y2", innerH)
    .style("opacity", 0);

  const categories = data.map(d => d[xField]);

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", innerW)
    .attr("height", innerH)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", (event) => {
      const [mx] = d3.pointer(event);

      const nearestKey = categories.reduce((a, b) => {
        const ca = x(a) + x.bandwidth() / 2;
        const cb = x(b) + x.bandwidth() / 2;
        return Math.abs(cb - mx) < Math.abs(ca - mx) ? b : a;
      });

      const d = data.find(row => row[xField] === nearestKey);
      const cx = x(nearestKey) + x.bandwidth() / 2;

      hoverLine
        .attr("x1", cx).attr("x2", cx)
        .style("opacity", 1);

      tooltip.show(event, `${d[xField]}: <b>${valueFormat(d[yField])}</b>`);
    })
    .on("mouseleave", () => {
      hoverLine.style("opacity", 0);
      tooltip.hide();
    });
}

// ---------- Q1 ----------
function drawQ1(rows) {
  if (!rows || !rows.length) return;

  const cols = Object.keys(rows[0]).filter(c => c !== "YEAR");

  const data = cols.map(col => ({
    jurisdiction: col.split("+")[0],
    total: d3.sum(rows, r => +r[col] || 0)
  })).sort((a, b) => b.total - a.total);

  const top = data[0];

  renderBarChart({
    elId: "q1Chart",
    data,
    xField: "jurisdiction",
    yField: "total",
    highlightKey: top ? top.jurisdiction : null,
    yLabel: "Total fines (all years)",
    valueFormat: fmt
  });
}

// ---------- Q2 (Trend Line 2008–2024 with Camera / Police / Others) ----------
function drawQ2(rows) {
  if (!rows.length) return;

  rows.forEach(r => r.YEAR = +r.YEAR);

  const data = rows.map(r => ({
    year: r.YEAR,
    camera: +r["camera-issued fine+Sum(FINES)"] || 0,
    police: +r["police-issued fine+Sum(FINES)"] || 0,
    others: +r["others+Sum(FINES)"] || 0
  })).sort((a, b) => a.year - b.year);

  const years = data.map(d => d.year);
  const byYear = new Map(data.map(d => [d.year, d]));

  const container = d3.select("#q2Chart");
  container.selectAll("*").remove();

  const width = container.node().clientWidth || 640;
  const height = 340;

  const margin = { top: 36, right: 40, bottom: 60, left: 80 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0, innerW]);

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => Math.max(d.camera, d.police, d.others)) * 1.1
    ])
    .range([innerH, 0])
    .nice();

  const lineCamera = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.camera))
    .curve(d3.curveMonotoneX);

  const linePolice = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.police))
    .curve(d3.curveMonotoneX);

  const lineOthers = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.others))
    .curve(d3.curveMonotoneX);

  const tooltip = createTooltip();

  const minYear = d3.min(years);
  const maxYear = d3.max(years);

  // Axes – show every year tick
  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(
      d3.axisBottom(x)
        .tickValues(d3.range(minYear, maxYear + 1))
        .tickFormat(d3.format("d"))
    );

  g.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(fmt));

  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerH / 2)
    .attr("y", -margin.left + 18)
    .attr("text-anchor", "middle")
    .text("Number of fines");

  // Lines
  g.append("path")
    .datum(data)
    .attr("class", "line-camera")
    .attr("d", lineCamera);

  g.append("path")
    .datum(data)
    .attr("class", "line-police")
    .attr("d", linePolice);

  g.append("path")
    .datum(data)
    .attr("class", "line-others")
    .attr("d", lineOthers);

  // Legend (top-right, outside chart)
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + innerW - 200}, 10)`);

  [
    { label: "Camera-issued",           cls: "legend-swatch-camera" },
    { label: "Police-issued",           cls: "legend-swatch-police" },
    { label: "Others (0–5 fines)",      cls: "legend-swatch-others" }
  ].forEach((item, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0,${i * 18})`);
    row.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("class", item.cls);
    row.append("text")
      .attr("class", "legend-text")
      .attr("x", 18)
      .attr("y", 10)
      .text(item.label);
  });

  // Hover vertical guideline + tooltip
  const hoverLine = g.append("line")
    .attr("class", "hover-line")
    .attr("y1", 0)
    .attr("y2", innerH)
    .style("opacity", 0);

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", innerW)
    .attr("height", innerH)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", (event) => {
      const [mx] = d3.pointer(event);
      const yr = x.invert(mx);

      const nearest = years.reduce((a, b) =>
        Math.abs(b - yr) < Math.abs(a - yr) ? b : a
      );
      const d = byYear.get(nearest);

      hoverLine
        .attr("x1", x(nearest))
        .attr("x2", x(nearest))
        .style("opacity", 1);

      tooltip.show(
        event,
        `<b>${nearest}</b><br>
         Camera: ${fmt(d.camera)}<br>
         Police: ${fmt(d.police)}<br>
         Others: ${fmt(d.others)}`
      );
    })
    .on("mouseleave", () => {
      hoverLine.style("opacity", 0);
      tooltip.hide();
    });
}

// ---------- Q3 (Pie with hover pop-out + smart labels) ----------
function drawQ3(rows) {
  if (!rows.length) return;

  const container = d3.select("#q3Chart");
  container.selectAll("*").remove();

  const data = rows.map(r => ({
    age: r.AGE_GROUP,
    fines: +r["Sum(FINES)"] || 0
  })).sort((a, b) => b.fines - a.fines);

  const total = d3.sum(data, d => d.fines);

  const width = container.node().clientWidth || 500;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 24;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.age))
    .range(d3.schemeSet2);

  const pie = d3.pie().value(d => d.fines).sort(null);
  const arcs = pie(data);

  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const labelArcInner = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.6);
  const labelArcOuter = d3.arc().innerRadius(radius * 1.12).outerRadius(radius * 1.12);

  const tooltip = createTooltip();

  // Slices
  g.selectAll("path.slice")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", "slice")
    .attr("d", arc)
    .attr("fill", d => color(d.data.age))
    .attr("stroke", "#111827")
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget)
        .transition().duration(120)
        .attr("transform", "scale(1.04)");
      tooltip.show(event,
        `${d.data.age}: <b>${fmt(d.data.fines)}</b> fines`);
    })
    .on("mousemove", (event, d) => {
      tooltip.show(event,
        `${d.data.age}: <b>${fmt(d.data.fines)}</b> fines`);
    })
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget)
        .transition().duration(120)
        .attr("transform", "scale(1)");
      tooltip.hide();
    });

  // Value labels – inside for big slices, just outside for small ones
  g.selectAll("text.pie-label")
    .data(arcs)
    .enter()
    .append("text")
    .attr("class", "pie-label")
    .attr("transform", d => {
      const fraction = d.data.fines / total;
      const targetArc = fraction < 0.12 ? labelArcOuter : labelArcInner;
      const [x, y] = targetArc.centroid(d);
      return `translate(${x},${y})`;
    })
    .text(d => fmt(d.data.fines));

  // Legend (same as before)
  const legend = svg.append("g")
    .attr("transform", "translate(10,10)");

  data.forEach((d, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0,${i * 18})`);
    row.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(d.age));
    row.append("text")
      .attr("class", "legend-text")
      .attr("x", 18)
      .attr("y", 10)
      .text(d.age);
  });
}


// ---------- Q4 (Horizontal bar chart for mean fine amount) ----------
function drawQ4(rows) {
  if (!rows.length) return;

  const container = d3.select("#q4Chart");
  container.selectAll("*").remove();

  const data = rows.map(r => ({
    jurisdiction: r.JURISDICTION,
    meanFine: +r["Mean(FINES)"] || 0
  })).sort((a, b) => b.meanFine - a.meanFine);

  const top = data[0];

  const width = container.node().clientWidth || 640;
  const height = 320;

  const margin = { top: 24, right: 40, bottom: 40, left: 120 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand()
    .domain(data.map(d => d.jurisdiction))
    .range([0, innerH])
    .padding(0.2);

  const maxX = d3.max(data, d => d.meanFine) || 0;
  const x = d3.scaleLinear()
    .domain([0, maxX * 1.1])
    .range([0, innerW])
    .nice();

  const tooltip = createTooltip();
  const valueFmtAvg = d3.format(".2f");

  g.append("g").call(d3.axisLeft(y));

  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(valueFmtAvg));

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", innerW / 2)
    .attr("y", innerH + 32)
    .attr("text-anchor", "middle")
    .text("Average fine amount in 2024");

  // Bars
  g.selectAll("rect.bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", d =>
      "bar " + (d.jurisdiction === top.jurisdiction ? "bar-highlight" : "bar-default")
    )
    .attr("x", 0)
    .attr("y", d => y(d.jurisdiction))
    .attr("width", d => x(d.meanFine))
    .attr("height", y.bandwidth());

  // Value labels on bars
  g.selectAll("text.bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => {
      const pos = x(d.meanFine) + 6;
      return pos > innerW - 40 ? innerW - 40 : pos;
    })
    .attr("y", d => y(d.jurisdiction) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => valueFmtAvg(d.meanFine));

  // Hover horizontal guideline
  const hoverLine = g.append("line")
    .attr("class", "hover-line")
    .attr("x1", 0)
    .attr("x2", innerW)
    .style("opacity", 0);

  const categories = data.map(d => d.jurisdiction);

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", innerW)
    .attr("height", innerH)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", (event) => {
      const [, my] = d3.pointer(event);

      const nearestKey = categories.reduce((a, b) => {
        const ay = y(a) + y.bandwidth() / 2;
        const by = y(b) + y.bandwidth() / 2;
        return Math.abs(by - my) < Math.abs(ay - my) ? b : a;
      });

      const d = data.find(row => row.jurisdiction === nearestKey);
      const cy = y(nearestKey) + y.bandwidth() / 2;

      hoverLine
        .attr("y1", cy)
        .attr("y2", cy)
        .style("opacity", 1);

      tooltip.show(event,
        `${d.jurisdiction}: <b>${valueFmtAvg(d.meanFine)}</b>`);
    })
    .on("mouseleave", () => {
      hoverLine.style("opacity", 0);
      tooltip.hide();
    });
}

// ---------- Q5 (Horizontal bar, sqrt scale, labels, guideline) ----------
function drawQ5(rows) {
  if (!rows.length) return;

  const data = rows.map(r => ({
    jurisdiction: r.JURISDICTION,
    fines: +r["Sum(FINES)"] || 0
  })).sort((a, b) => b.fines - a.fines);

  const top = data[0];

  const container = d3.select("#q5Chart");
  container.selectAll("*").remove();

  const width = container.node().clientWidth || 640;
  const height = 320;

  const margin = { top: 24, right: 30, bottom: 40, left: 120 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const svg = container.append("svg")
    .attr("width", width).attr("height", height);
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand()
    .domain(data.map(d => d.jurisdiction))
    .range([0, innerH])
    .padding(0.2);

  const maxX = d3.max(data, d => d.fines) || 0;
  const x = d3.scaleSqrt()
    .domain([0, maxX])
    .range([0, innerW]);

  const tooltip = createTooltip();

  g.append("g").call(d3.axisLeft(y));

  g.append("g")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(fmt));

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", innerW / 2)
    .attr("y", innerH + 32)
    .attr("text-anchor", "middle")
    .text("Fines in 2024 (age 0–16) — sqrt scale");

  g.selectAll("rect.bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", d =>
      "bar " + (d.jurisdiction === top.jurisdiction ? "bar-highlight" : "bar-default")
    )
    .attr("x", 0)
    .attr("y", d => y(d.jurisdiction))
    .attr("width", d => x(d.fines))
    .attr("height", y.bandwidth());

  // Value labels on bars
  g.selectAll("text.bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => {
      const pos = x(d.fines) + 6;
      return pos > innerW - 40 ? innerW - 40 : pos;
    })
    .attr("y", d => y(d.jurisdiction) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text(d => fmt(d.fines));

  // Hover horizontal guideline
  const hoverLine = g.append("line")
    .attr("class", "hover-line")
    .attr("x1", 0)
    .attr("x2", innerW)
    .style("opacity", 0);

  const categories = data.map(d => d.jurisdiction);

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", innerW)
    .attr("height", innerH)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", (event) => {
      const [, my] = d3.pointer(event);

      const nearestKey = categories.reduce((a, b) => {
        const ay = y(a) + y.bandwidth() / 2;
        const by = y(b) + y.bandwidth() / 2;
        return Math.abs(by - my) < Math.abs(ay - my) ? b : a;
      });

      const d = data.find(row => row.jurisdiction === nearestKey);
      const cy = y(nearestKey) + y.bandwidth() / 2;

      hoverLine
        .attr("y1", cy)
        .attr("y2", cy)
        .style("opacity", 1);

      tooltip.show(event,
        `${d.jurisdiction}: <b>${fmt(d.fines)}</b> fines`);
    })
    .on("mouseleave", () => {
      hoverLine.style("opacity", 0);
      tooltip.hide();
    });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  d3.csv("../data/q1.csv").then(drawQ1);
  d3.csv("../data/q2.csv").then(drawQ2);
  d3.csv("../data/q3.csv").then(drawQ3);
  d3.csv("../data/q4.csv").then(drawQ4);
  d3.csv("../data/q5.csv").then(drawQ5);
});
