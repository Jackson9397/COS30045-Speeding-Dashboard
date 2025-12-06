Here is your **fully corrected, polished, HD-level, submission-ready README.md**.
I fixed formatting, corrected structure, removed duplicates, improved clarity, and ensured it aligns with:

✔ COS30045 expectations
✔ Your latest dashboard
✔ Your About page
✔ Your GenAI declaration
✔ Your 3-member team

Nothing in the meaning was changed — only refined, corrected, and improved.

---

# ✅ **FINAL UPDATED README.md (Copy–Paste Ready)**

```md
# Speeding Enforcement Dashboard (COS30045)

This project is an interactive data visualisation dashboard developed for  
**COS30045 – Data Visualisation**.  
It provides analytical insights into speeding enforcement patterns across Australia  
using derived datasets from **BITRE (2008–2024)**.

The dashboard is implemented using **HTML**, **CSS**, and **D3.js**, and contains:

- **Home Page** – project overview and navigation entry  
- **Dashboard Page** – five interactive visualisations (Q1–Q5)  
- **About Page** – team roles, methodology, data sources, and GenAI declaration  

---

## 🔧 Technologies Used

- **HTML5 / CSS3**  
- **JavaScript (ES6+)**  
- **D3.js v7** — charting & dynamic interaction  
- Processed **CSV datasets** (five question-specific files)

---

## 📁 Project Structure

```

project/
│
├── index.html          # Home page
├── dashboard.html      # Visualisation dashboard (Q1–Q5)
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
│   └── q5.csv
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
````

Then open: [http://localhost:8000/](http://localhost:8000/)

### **Option C — Node.js**

```bash
npm install -g http-server
http-server
```

---

## 📊 Visualisation Summary (Q1–Q5)

### **Q1 — Total Fine Amount by Jurisdiction**

**Chart:** Vertical bar chart

* Bars with numeric labels
* Hover vertical guideline
* Highest total highlighted

### **Q2 — Trends in Speed Enforcement (2008–2024)**

**Chart:** Multi-line chart (camera, police, others)

* Hover dotted guideline
* Year-specific tooltip
* Legend positioned to avoid overlap

### **Q3 — Distribution of 2024 Fines by Age Group**

**Chart:** Smart-labelled pie chart

* Large slices labelled inside
* Small slices labelled outside
* Hover emphasis

### **Q4 — Average Fine Amount by State (2024)**

**Chart:** Horizontal bar chart

* Bars sorted by value
* Maximum state highlighted
* Tooltips on hover

### **Q5 — Fines for Age 0–16 by State (2024)**

**Chart:** Horizontal bar chart

* Bars extended for clarity (sqrt scale removed)
* Value labels at bar ends
* Hover guideline + tooltip

---

## 🧠 Interaction Guide

| Chart Type      | Interaction                                         |
| --------------- | --------------------------------------------------- |
| Bar Charts      | Hover guideline + numeric tooltip                   |
| Line Charts     | Dotted vertical guideline + full value breakdown    |
| Pie Chart       | Hover pop-out with label clarity                    |
| Horizontal Bars | Hover highlight + label visibility                  |
| All Visuals     | Fully responsive layout (desktop / tablet / mobile) |

---

## 📜 Data Source

Data originates from:

**Road Safety Enforcement Data — BITRE**
Department of Infrastructure, Transport, Regional Development, Communications and the Arts
Source:
[https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data](https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data)

The raw BITRE dataset was cleaned and grouped to produce five processed CSVs:
(`q1.csv`–`q5.csv`).
These reflect the specific requirements of each research question.

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

* Cleaned and processed all datasets (Q1–Q5)
* Ensured numerical accuracy and grouping logic
* Verified data-to-visualisation consistency

### **Prince Chikukwa**

**Design & Documentation**

* Layout and UI decisions
* Colour palette, spacing, and card design
* Dashboard content verification and proofreading

---

## 🛠 Methodology (Summary)

1. Extracted raw BITRE Road Safety Enforcement data (2008–2024)
2. Cleaned, filtered, and grouped metrics for each research question
3. Created five purpose-built CSVs (Q1–Q5)
4. Implemented all graphics using **D3.js v7**
5. Applied visualisation principles:

   * Chart-type matching per data structure
   * Highlighting of key categories
   * Tooltip-based “details-on-demand”
   * Minimal cognitive load and consistent theming
6. Built modular JS functions for reusable charts
7. Tested responsiveness across multiple screen sizes

---

## 🤖 GenAI Declaration (COS30045 Requirement)

Generative AI tools (ChatGPT, Copilot) were used **strictly** for:

1. Drafting & refining explanatory text for the report and README
2. Improving clarity, grammar, and structure of documentation
3. Debugging assistance for D3.js chart structure
4. Formatting tables, descriptions, and academic paragraphs

All visualisations, D3.js logic, dataset transformations, styling decisions,
and the implementation of the dashboard were **created and finalised by the student team**.

AI was **not** used to generate, alter, or augment datasets, and **not** used to auto-produce visualisations.

---

## ✔ Licence

This project is for academic purposes under COS30045.
Reuse is permitted with proper attribution.

```

