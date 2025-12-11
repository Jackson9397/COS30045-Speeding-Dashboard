# Speeding Enforcement Dashboard (COS30045)

This project is an interactive data visualisation dashboard developed for  
**COS30045 – Data Visualisation**.  
It provides analytical insights into speeding enforcement patterns across Australia  
using derived datasets from **BITRE (2008–2024)**.

The dashboard is implemented using **HTML**, **CSS**, and **D3.js**, and contains:

- **Home Page** – project overview and navigation entry  
- **Dashboard Page** – six interactive visualisations (Q1–Q6)  
- **About Page** – team roles, methodology, data sources, and GenAI declaration  

---

## 🔧 Technologies Used

- **HTML5 / CSS3**  
- **JavaScript (ES6+)**  
- **D3.js v7** — charting & dynamic interaction  
- Processed **CSV datasets** (six question-specific files)

---

## 📁 Project Structure

```text
project/
│
├── index.html          # Home page
├── dashboard.html      # Visualisation dashboard (Q1–Q6)
├── about.html          # Team info, methodology, GenAI declaration
│
├── css/
│   └── style.css       # Global UI, layout, and chart theme styles
│
├── js/
│   └── script.js       # All D3.js visualisations + interactions
│
├── data/
│   ├── q1.csv
│   ├── q2.csv
│   ├── q3.csv
│   ├── q4.csv
│   ├── q5.csv
│   └── q6.csv
│
└── assets/
    └── logo.png
````

All working files match the system versions:
`index.html`, `dashboard.html`, `about.html`, `style.css`, and `script.js`.

---

## ▶️ How to Run the Dashboard

Because browsers block `d3.csv()` when HTML files are opened directly,
you must use a **local development server**.

### **Option A — VS Code (Recommended)**

1. Install **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

### **Option B — Python**

```bash
python3 -m http.server
```

Then open: [http://localhost:8000/](http://localhost:8000/)

### **Option C — Node.js**

```bash
npm install -g http-server
http-server
```

---

## 📊 Visualisation Summary (Q1–Q6)

### **Q1 — Total Fine Amount by Jurisdiction**

**Chart:** Vertical bar chart

* Bars with numeric labels
* Hover vertical guideline
* Highest total highlighted

---

### **Q2 — Trends in Speed Enforcement (2008–2024)**

**Chart:** Multi-line chart (camera, police, others)

* Hover vertical guideline
* Year-specific tooltip showing all three series
* Legend positioned to avoid overlap with the lines

---

### **Q3 — Distribution of 2024 Fines by Age Group**

**Chart:** Smart-labelled pie chart

* Large slices labelled inside the chart
* Small slices labelled just outside for readability
* Hover emphasis with tooltip values

---

### **Q4 — Average Fine Amount by State (2024)**

**Chart:** Horizontal bar chart

* Bars sorted by average fine amount
* State with highest average highlighted
* Numeric labels at the end of each bar
* Hover guideline and tooltip with exact value

---

### **Q5 — Fines for Age 0–16 by State (2024)**

**Chart:** Horizontal bar chart (square-root x-scale)

* Uses sqrt scale to reduce skew while keeping relative differences visible
* Bars sorted by total fines for 0–16 age group
* Top state highlighted
* Value labels on bars plus hover guideline + tooltip

---

### **Q6 — Average Speeding Fines per 10,000 Licences (2024)**

**Chart:** Horizontal bar chart

* Compares the **average number of speeding fines per 10,000 licence holders** in each state for 2024
* Bars sorted from highest to lowest rate
* The state with the highest rate is visually highlighted
* Numeric labels at the end of each bar
* Hover horizontal guideline and tooltip showing:
  `State: X.X fines per 10,000 licences`

---

## 🧠 Interaction Guide

| Chart Type      | Interaction                                   |
| --------------- | --------------------------------------------- |
| Bar Charts      | Hover guideline + numeric tooltip             |
| Line Charts     | Vertical guideline + year-specific breakdown  |
| Pie Chart       | Hover pop-out with value labels               |
| Horizontal Bars | Highlight + label visibility on hover         |
| All Visuals     | Responsive layout (desktop / tablet / mobile) |

---

## 📜 Data Source

Data originates from:

**Road Safety Enforcement Data — BITRE**
Department of Infrastructure, Transport, Regional Development, Communications and the Arts

Source:
[https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data](https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data)

The raw BITRE dataset was cleaned and grouped to produce six processed CSVs:
`q1.csv`–`q6.csv`, each tailored to one research question.

---

## 👥 Team Roles (as displayed on About page)

### **Ho Sheng Yang**

**Lead Developer**

* Full D3.js implementation
* Chart rendering, tooltips, hover guidelines
* UI layout restructuring, responsive styling
* Debugging and code optimisation

### **Hu Jia Qi**

**Data Specialist**

* Cleaned and processed all datasets (Q1–Q6)
* Ensured numerical accuracy and grouping logic
* Verified data-to-visualisation consistency

### **Prince Chikukwa**

**Design & Documentation**

* Layout and UI decisions
* Colour palette, spacing, and card design
* Dashboard content verification and proofreading

---

## 🛠 Methodology (Summary)

1. Extracted raw BITRE Road Safety Enforcement data (2008–2024).
2. Cleaned, filtered, and grouped metrics for each research question.
3. Created six purpose-built CSVs (Q1–Q6).
4. Implemented all graphics using **D3.js v7**.
5. Applied visualisation principles:

   * Matching chart types to data structure
   * Highlighting key categories
   * Tooltip-based “details-on-demand”
   * Consistent theming with low cognitive load
6. Built modular JS functions for reusable charts.
7. Tested responsiveness across multiple screen sizes.

---

## 🤖 GenAI Declaration (COS30045 Requirement)

Generative AI tools (e.g. ChatGPT, Copilot) were used **only** for:

1. Drafting and refining explanatory text for the report and README.
2. Improving clarity, grammar, and structure of documentation.
3. Debugging assistance for D3.js chart structure and syntax.
4. Formatting tables, descriptions, and academic paragraphs.

All visualisations, D3.js logic, dataset transformations, styling decisions,
and the implementation of the dashboard were **created and finalised by the student team**.

AI was **not** used to generate, alter, or augment datasets,
and **not** used to auto-produce visualisations.

---

## ✔ Licence

This project is for academic purposes under COS30045.
Reuse is permitted with proper attribution.

```
