# MLT002 — Luminox.fx Polyglot Portfolio

![AI Coded](https://img.shields.io/badge/Code-100%25%20AI%20Generated-blueviolet)
![Languages](https://img.shields.io/badge/Languages-11%20Polyglot%20Stack-0284c7)
![Hosting](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-22c55e)

**MLT002** is an experimental, 100% AI-coded multi-language web portfolio and interactive runtime lab built for **Luminox.fx** (by Debasis). Engineered as a zero-dependency static architecture, it combines real-time GPU shaders, dynamic JSON service catalogs, in-browser Python WebAssembly execution, and automated C# / Python GitHub Actions telemetry—all deployable directly from a mobile Termux workflow.

**Live Site:** [https://sadaejin.github.io/MLT002/](https://sadaejin.github.io/MLT002/)

---

## Multi-Language Stack (11 Languages)

| Language | File(s) | Role in MLT002 |
| :--- | :--- | :--- |
| **HTML5** | `index.html` | Semantic page structure, accessible sections, and interactive brief editor |
| **CSS3** | `style.css` | Obsidian Dark theme, Editorial Light mode, 1px hairline grids, and synced RGB Party mode |
| **JavaScript (ES6+)** | `app.js` | WebGL shader controller, state router, `mailto:` brief generator, and WASM runtime bridge |
| **GLSL** | `shader.glsl` | Real-time GPU fragment shader rendering pointer-reactive void particles and light halos |
| **Python 3** | `analytics.py` | Portfolio pricing analytics engine (runs in GitHub Actions and in-browser via Pyodide WASM) |
| **C# (.NET 8)** | `QuantCore.cs` | Quantitative Fibonacci level, risk-reward, and position-sizing calculator |
| **JSON** | `portfolio.json`, `telemetry.json`, `quant-output.json` | Studio service database and automated CI telemetry outputs |
| **YAML** | `.github/workflows/polyglot-ci.yml` | GitHub Actions CI/CD workflow that compiles C# and runs Python on every push |
| **XML** | `MLT001.csproj`, `sitemap.xml` | .NET 8 project build configuration and search engine sitemap |
| **Shell (Bash)** | `deploy.sh` | Termux/Linux automation script for local validation and Git deployment |
| **SVG** | `index.html` (inline) | Resolution-independent geometric vector emblems |

---

## Repository Structure

```text
MLT002/
├── .github/
│   └── workflows/
│       └── polyglot-ci.yml   # Automated Python 3 & .NET 8 CI runner
├── index.html                # Main portfolio & Polyglot Runtime Lab UI
├── style.css                 # Responsive themes (Dark / Light / Party RGB)
├── app.js                    # WebGL engine, UI state manager & WASM loader
├── shader.glsl               # GPU fragment shader
├── portfolio.json            # Divisions, pricing tiers & project brief templates
├── analytics.py              # Python pricing & division telemetry analyzer
├── QuantCore.cs              # C# quantitative trading signal engine
├── MLT001.csproj             # .NET 8 build manifest
├── telemetry.json            # Auto-generated Python telemetry output
├── quant-output.json         # Auto-generated C# execution output
├── sitemap.xml               # XML sitemap
├── deploy.sh                 # Termux Git push helper
└── README.md                 # Project documentation
