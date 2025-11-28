# Speeding Enforcement Dashboard (COS30045)

This project is an interactive data visualisation dashboard developed for  
**COS30045 – Data Visualisation**.  
It provides analytical insights into Australian speeding enforcement patterns using  
open data from BITRE (2008–2024).

The website is built using **HTML**, **CSS**, **D3.js** and five custom CSV datasets.  
It includes three main pages:

- **Home** — Introduction and entry point  
- **Dashboard** — Five interactive visualisations  
- **About** — Team roles, methodology, data-source information  

---

## 🔧 Technologies Used
- HTML5 / CSS3  
- JavaScript (ES6)  
- **D3.js v7** for all charts  
- CSV data (cleaned and processed externally)

---

## 📁 Project Structure

```

project/
│
├── index.html
├── dashboard.html
├── about.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
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

This structure corresponds to the working files in the system:  
`index.html` :contentReference[oaicite:5]{index=5}  
`dashboard.html` :contentReference[oaicite:6]{index=6}  
`about.html` :contentReference[oaicite:7]{index=7}  
`style.css` :contentReference[oaicite:8]{index=8}  
`script.js` :contentReference[oaicite:9]{index=9}  

---

## ▶️ How to Run

Because browsers block `d3.csv()` when opening files directly,  
you must run **a local server**.

### **Option A (Recommended) — VS Code Live Server**
1. Install **Live Server** extension  
2. Right-click `index.html` → **Open with Live Server**

### **Option B — Python**
```bash
python3 -m http.server
````

Open:
[http://localhost:8000/](http://localhost:8000/)

### **Option C — Node.js**

```bash
npm install -g http-server
http-server
```

---

## 📊 Dashboard Visualisations (Q1–Q5)

### **Q1 — Total Fine Amount by Jurisdiction**

**Chart type:** Vertical bar chart

* Bars with labels on top
* Hover vertical guideline + tooltip
* Highest jurisdiction highlighted

### **Q2 — Trends in Camera / Police / Others (2008–2024)**

**Chart type:** Multi-line chart

* Three lines: *camera-issued*, *police-issued*, *others*
* Hover vertical dotted line
* Exact values in tooltip
* Legend positioned above plotting area

### **Q3 — Distribution of 2024 Fines by Age Group**

**Chart type:** Smart-labelled pie chart

* Large slices labelled inside
* Small slices labelled outside
* Hover pop-out animation

### **Q4 — Average 2024 Fine Amount by State**

**Chart type:** Area + line chart

* Smooth monotone curve
* Highlighted maximum point
* Hover guideline showing exact value

### **Q5 — 0–16 Age Group Fines by State (2024)**

**Chart type:** Horizontal bar (sqrt scale)

* Bars extended for visibility
* Values shown at end of bars
* Hover horizontal guideline + tooltip

---

## 🧠 Interaction Guide

| Chart              | Interaction                             |
| ------------------ | --------------------------------------- |
| Bar Charts         | Hover guideline + tooltip               |
| Line & Area Charts | Hover reveals dotted guideline & values |
| Pie Chart          | Slice pop-out on hover                  |
| Horizontal Bars    | Tooltip + guideline                     |
| All Charts         | Smooth resizing + responsive layout     |

---

## 📜 Data Source

Data is based on the official BITRE dataset:

> **Road Safety Enforcement Data (BITRE)**
> Department of Infrastructure, Transport, Regional Development, Communications and the Arts
> Source link (via About page):
> [https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data](https://catalogue.data.infrastructure.gov.au/dataset/road-safety-enforcement-data)

CSV cleaning, grouping, and summarisation were done manually to create Q1–Q5 datasets.
(As reflected in the descriptions on `about.html`.)


---

## 👥 Team Roles

From the About page (summarised):


### **Ho Sheng Yang**

Lead Developer — Full D3.js implementation, chart interactivity, layout restructuring, styling, debugging, integration.

### **Hu Jia Qi**

Data Processing — Cleaned and prepared all five CSV datasets (Q1–Q5).

### **Prince Chikukwa**

Design & Documentation — Layout decisions, styling, and verifying dashboard output.

---

## 🛠 Methodology

As documented on the About page:


* Extracted data from BITRE Road Safety Enforcement (2008–2024)
* Prepared 5 cleaned, question-specific CSVs
* Used D3.js for all chart rendering
* Applied visualisation principles (highlighting, tooltips, labelling, hover guides)
* Designed dashboard layout using reusable components in `script.js`

---

## 🤖 GenAI Declaration (COS30045 Requirement)

This project incorporated Generative AI tools (ChatGPT, Copilot) for the following purposes:

1. Drafting and reviewing explanatory text for the report and README documentation  
2. Refining descriptions of visualisation methods, user interaction behaviour, and design rationale  
3. Assisting with debugging and structuring D3.js functions  
4. Formatting tables, diagrams, and paragraphs into academic-appropriate styles  
5. Improving clarity, grammar, and readability of written content

All final D3.js implementations, data processing decisions, layout structures, styling, and design changes were created, validated, and finalised by the student team.  
AI tools were **not** used to generate or alter datasets, and were **not** used to automatically create visualisations.


## ✔ Licence

This project is for academic use only under COS30045.
Reuse is allowed with proper attribution.
