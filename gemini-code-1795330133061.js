const FALLBACK_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_light;
uniform float u_party;
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  float halo = 0.03 / (abs(length(uv) - 0.34 - 0.03 * sin(u_time * 1.3)) + 0.035);
  vec3 bg = mix(vec3(0.024, 0.024, 0.032), vec3(0.968, 0.968, 0.972), u_light);
  vec3 tint = mix(mix(vec3(0.92), vec3(0.12), u_light), u_color, u_party);
  gl_FragColor = vec4(mix(bg, tint, clamp(halo * 0.65, 0.0, 1.0)), 1.0);
}`;

const FALLBACK_PORTFOLIO = {
  email: "luminoxdesignstudio@gmail.com",
  divisions: [
    {
      id: "motion",
      number: "01 / 04",
      tabLabel: "01 Motion",
      title: "Motion & Animation",
      headline: "Dynamic visual storytelling.",
      summary: "Cinematic motion graphics, After Motion Z+, FlipaClip, Keyflow, and advanced timeline keyframing built to raise production value and craft compelling narratives.",
      status: "OPEN",
      footnote: "Default delivery in .mp4 (9:16, 1:1, or 16:9), with alternative formats available upon request.",
      tiers: [
        { name: "Micro-Edits & Add-Ons", price: "$1.99 – $4.99", fit: "Quick fixes or format tweaks.", features: ["File conversions", "Color & text adjustments", "Overlay additions"] },
        { name: "Custom Design Entry", price: "$35.00", fit: "Custom social ads and product promos.", features: ["Custom motion design", "Timeline keyframing", "Standard .mp4 delivery"] },
        { name: "Maximum Customization", price: "$99.00", fit: "Flagship campaigns and complex VFX.", features: ["Full-custom production", "Heavy keyframing & VFX", "Multi-format delivery"] }
      ],
      briefTemplate: "// LUMINOX.FX — MOTION BRIEF\nTarget Tier: [$35 Entry / $50 Intermediate / $99 Maximum]\nRequirements: [Describe your edit]"
    },
    {
      id: "web",
      number: "02 / 04",
      tabLabel: "02 Web",
      title: "Web Architecture",
      headline: "Spatial UIs & Fast Frontends.",
      summary: "Termux (Mobile-first Dev), Vanilla JavaScript, WebGL, Canvas API, and CSS Grid engineered cleanly for highly interactive and optimized modern web experiences.",
      status: "OPEN",
      footnote: "Zero-dependency production code delivered ready for GitHub Pages or Vercel.",
      tiers: [
        { name: "Landing Page Foundation", price: "$150.00", fit: "Single-page creator or brand hub.", features: ["HTML/CSS/JS architecture", "Responsive mobile layout", "Fast zero-dependency build"] },
        { name: "Multi-Page Ecosystem", price: "$400.00", fit: "Multi-page business websites.", features: ["Up to 5 pages", "CSS Grid layouts", "Light/Dark theme toggle"] },
        { name: "Immersive Web App", price: "$900.00+", fit: "Interactive WebGL & spatial UIs.", features: ["3D particle & GLSL shaders", "Custom JS physics", "Bespoke UI/UX architecture"] }
      ],
      briefTemplate: "// LUMINOX.FX — WEB BRIEF\nTarget Tier: [$150 Foundation / $400 Ecosystem / $900+ Immersive]\nRequirements: [Describe your site]"
    },
    {
      id: "market",
      number: "03 / 04",
      tabLabel: "03 Market Tech",
      title: "Market & Financial Tech",
      headline: "Precision data overlays.",
      summary: "TradingView Custom Integrations, MetaTrader 5 (MT5), Binance API, and \"God's Eye\" Terminal Engineering providing robust real-time data overlays.",
      status: "CLOSED",
      footnote: "// STATUS: Commissions for the Market & Financial Tech division are currently CLOSED.",
      tiers: [
        { name: "Custom Indicator / Script", price: "$50.00", fit: "Technical overlays & alerts.", features: ["PineScript or MQL5", "Custom visual zones", "Alert integration"] },
        { name: "Automated Strategy Bot", price: "$200.00", fit: "Automated rule execution.", features: ["Entry/exit automation", "Risk management logic", "Backtesting setup"] },
        { name: "God's Eye Terminal UI", price: "$800.00+", fit: "Bespoke multi-API trading dashboards.", features: ["Real-time data visualizers", "Multi-API integration", "Dark-mode terminal UI"] }
      ],
      briefTemplate: "// STATUS: Market & Financial Tech commissions are currently CLOSED."
    },
    {
      id: "audio",
      number: "04 / 04",
      tabLabel: "04 Audio & AI",
      title: "Audio & AI Synthesis",
      headline: "Spatial soundscapes.",
      summary: "ElevenLabs Audio Engineering, Spatial Web Audio, precise digital sound design, and robust version control architecture for high-end environments.",
      status: "OPEN",
      footnote: "Delivered in mastered .wav and .mp3 formats.",
      tiers: [
        { name: "UI Sound Design / SFX", price: "$30.00", fit: "Micro-interaction audio packs.", features: ["5–10 custom UI sounds", "Minimalist/futuristic profile", ".wav & .mp3 formats"] },
        { name: "AI Voice Tuning & Sync", price: "$80.00", fit: "Emotionally tuned AI voiceovers.", features: ["ElevenLabs tuning", "Up to 2 mins script", "Timeline pacing sync"] },
        { name: "Spatial Audio Mix", price: "$150.00+", fit: "Full cinematic sound design.", features: ["Complete soundbed", "3D spatial panning", "Mobile & headphone master"] }
      ],
      briefTemplate: "// LUMINOX.FX — AUDIO BRIEF\nTarget Tier: [$30 SFX / $80 Voice / $150+ Spatial Mix]\nRequirements: [Describe your project]"
    }
  ]
};

const state = {
  portfolio: FALLBACK_PORTFOLIO,
  activeDivId: "motion",
  party: false,
  light: false,
  hue: 295,
  mouseX: 0,
  mouseY: 0,
  targetX: 0,
  targetY: 0
};

let pyodideInstance = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [r + m, g + m, b + m];
}

function syncMailtoLink() {
  const editor = document.getElementById("briefEditor");
  const launchBtn = document.getElementById("launchEmailBtn");
  const div = state.portfolio.divisions.find((d) => d.id === state.activeDivId);
  const subject = `Project Inquiry [${div ? div.title : "Luminox.fx"}]`;
  const body = editor.value;
  launchBtn.href = `mailto:${state.portfolio.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function selectDivision(divId, preselectedTier = null, scrollToBrief = false) {
  const div = state.portfolio.divisions.find((d) => d.id === divId) || state.portfolio.divisions[0];
  state.activeDivId = div.id;

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === div.id);
  });

  document.querySelectorAll(".arsenal-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === div.id);
  });

  const isClosed = div.status === "CLOSED";
  document.getElementById("activeDivCode").textContent = `${div.number} / ${div.title.toUpperCase()}`;
  document.getElementById("activeDivTitle").textContent = div.headline;
  document.getElementById("activeDivDesc").textContent = div.summary;

  const statusPill = document.getElementById("activeDivStatus");
  statusPill.textContent = isClosed ? "COMMISSIONS CLOSED" : "OPEN FOR COMMISSIONS";
  statusPill.classList.toggle("closed", isClosed);

  const tiersGrid = document.getElementById("tiersGrid");
  tiersGrid.innerHTML = div.tiers
    .map(
      (tier) => `
      <div class="tier-box">
        <div>
          <div class="tier-name">${tier.name}</div>
          <div class="tier-price">${tier.price}</div>
          <p class="tier-fit">${tier.fit}</p>
          <ul class="tier-list">
            ${tier.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>
        <button
          type="button"
          class="tier-select-btn"
          data-tier="${tier.name} (${tier.price})"
          ${isClosed ? "disabled" : ""}
        >
          ${isClosed ? "UNAVAILABLE" : "LOAD BRIEF TEMPLATE \u2192"}
        </button>
      </div>`
    )
    .join("");

  tiersGrid.querySelectorAll(".tier-select-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectDivision(div.id, btn.dataset.tier, true);
    });
  });

  document.getElementById("tiersFootnote").textContent = div.footnote;

  const editor = document.getElementById("briefEditor");
  let template = div.briefTemplate;
  if (preselectedTier) {
    template = template.replace(/Target Tier: \[.*?\]/, `Target Tier: ${preselectedTier}`);
  }
  editor.value = template;
  syncMailtoLink();

  if (scrollToBrief) {
    document.getElementById("brief").scrollIntoView({ behavior: "smooth" });
    showToast(`Loaded ${preselectedTier}`);
  }
}

function renderPortfolio() {
  const tabsWrap = document.getElementById("divisionTabs");
  const gridWrap = document.getElementById("arsenalGrid");

  tabsWrap.innerHTML = state.portfolio.divisions
    .map(
      (div) => `
      <button type="button" class="tab-btn" data-id="${div.id}">
        ${div.tabLabel}
      </button>`
    )
    .join("");

  gridWrap.innerHTML = state.portfolio.divisions
    .map(
      (div) => `
      <article class="arsenal-card" data-id="${div.id}" tabindex="0" role="button">
        <div class="card-top-row">
          <span>${div.number}</span>
          ${div.status === "CLOSED" ? '<span class="badge-closed">CLOSED</span>' : "<span>ACTIVE</span>"}
        </div>
        <h3>${div.title}</h3>
        <p>${div.summary}</p>
      </article>`
    )
    .join("");

  tabsWrap.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectDivision(btn.dataset.id));
  });

  gridWrap.querySelectorAll(".arsenal-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectDivision(card.dataset.id);
      document.getElementById("tiersPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectDivision(card.dataset.id);
      }
    });
  });

  document.querySelectorAll(".footer-link-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectDivision(btn.dataset.selectDiv);
      document.getElementById("arsenal").scrollIntoView({ behavior: "smooth" });
    });
  });

  selectDivision(state.activeDivId);
}

function initWebGL(fragmentSource) {
  const canvas = document.getElementById("glCanvas");
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  const vertexSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, vertexSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "u_time");
  const uRes = gl.getUniformLocation(program, "u_resolution");
  const uMouse = gl.getUniformLocation(program, "u_mouse");
  const uColor = gl.getUniformLocation(program, "u_color");
  const uLight = gl.getUniformLocation(program, "u_light");
  const uParty = gl.getUniformLocation(program, "u_party");

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.targetX = (e.clientX - rect.left) * dpr;
    state.targetY = (rect.height - (e.clientY - rect.top)) * dpr;
  });

  const start = performance.now();
  function render(now) {
    const elapsed = (now - start) * 0.001;
    state.mouseX += (state.targetX - state.mouseX) * 0.08;
    state.mouseY += (state.targetY - state.mouseY) * 0.08;

    if (state.party) {
      state.hue = (state.hue + 1.4) % 360;
      document.documentElement.style.setProperty("--accent", `hsl(${state.hue}, 92%, 58%)`);
    }

    const [r, g, b] = hslToRgb(state.hue, 0.9, 0.56);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, state.mouseX, state.mouseY);
    gl.uniform3f(uColor, r, g, b);
    gl.uniform1f(uLight, state.light ? 1.0 : 0.0);
    gl.uniform1f(uParty, state.party ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

async function runPythonInBrowser() {
  const statusEl = document.getElementById("pyStatus");
  const consoleEl = document.getElementById("pyConsole");
  const btn = document.getElementById("runPyBtn");

  btn.disabled = true;
  try {
    if (!pyodideInstance) {
      statusEl.textContent = "LOADING WASM (~6MB)...";
      consoleEl.textContent = "// Downloading Pyodide WebAssembly runtime...";
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      pyodideInstance = await window.loadPyodide();
    }

    statusEl.textContent = "EXECUTING ANALYTICS.PY...";
    const pyCode = await fetch("./analytics.py").then((r) => r.text());
    await pyodideInstance.runPythonAsync(pyCode);

    const jsonInput = JSON.stringify(state.portfolio);
    pyodideInstance.globals.set("raw_input_json", jsonInput);
    const output = await pyodideInstance.runPythonAsync("analyze_portfolio(raw_input_json)");

    consoleEl.textContent = output;
    statusEl.textContent = "ACTIVE (CPYTHON WASM)";
    showToast("Python analytics executed in browser");
  } catch (err) {
    statusEl.textContent = "ERROR";
    consoleEl.textContent = `// Error: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

function runCSharpSimulation() {
  const bal = parseFloat(document.getElementById("qBalance").value) || 10000;
  const risk = parseFloat(document.getElementById("qRisk").value) || 1.5;
  const low = parseFloat(document.getElementById("qLow").value) || 2610;
  const high = parseFloat(document.getElementById("qHigh").value) || 2685;

  const range = Math.abs(high - low);
  const entry = +(high - range * 0.382).toFixed(2);
  const stopLoss = +low.toFixed(2);
  const takeProfit = +(high + range * 0.618).toFixed(2);
  const riskPerUnit = Math.max(Math.abs(entry - stopLoss), 0.01);
  const rrRatio = +(Math.abs(takeProfit - entry) / riskPerUnit).toFixed(2);
  const units = +((bal * (risk / 100)) / riskPerUnit).toFixed(4);

  const output = {
    Engine: "C# .NET 8 // Luminox QuantCore",
    Symbol: "XAUUSD",
    EntryPrice: entry,
    StopLoss: stopLoss,
    TakeProfit: takeProfit,
    RiskRewardRatio: rrRatio,
    RecommendedPositionUnits: units,
    FibonacciLevels: {
      "0.236": +(high - range * 0.236).toFixed(2),
      "0.382": entry,
      "0.500": +(high - range * 0.5).toFixed(2),
      "0.618": +(high - range * 0.618).toFixed(2),
      "1.618_EXT": takeProfit
    }
  };

  document.getElementById("csConsole").textContent = JSON.stringify(output, null, 2);
}

function initPolyglotLab() {
  const pyBtn = document.getElementById("runPyBtn");
  const csBtn = document.getElementById("runCsBtn");
  if (pyBtn) pyBtn.addEventListener("click", runPythonInBrowser);
  if (csBtn) {
    csBtn.addEventListener("click", () => {
      runCSharpSimulation();
      showToast("C# QuantCore calculation updated");
    });
    runCSharpSimulation();
  }
}

async function init() {
  const partyBtn = document.getElementById("partyToggle");
  const themeBtn = document.getElementById("themeToggle");
  const briefEditor = document.getElementById("briefEditor");
  const copyBriefBtn = document.getElementById("copyBriefBtn");
  const copyEmailBtn = document.getElementById("copyEmailBtn");

  partyBtn.addEventListener("click", () => {
    state.party = !state.party;
    partyBtn.classList.toggle("active", state.party);
    partyBtn.setAttribute("aria-pressed", String(state.party));
    document.documentElement.setAttribute("data-party", String(state.party));
    if (!state.party) {
      document.documentElement.style.removeProperty("--accent");
    }
  });

  themeBtn.addEventListener("click", () => {
    state.light = !state.light;
    document.documentElement.setAttribute("data-theme", state.light ? "light" : "dark");
    themeBtn.textContent = state.light ? "[ DARK ]" : "[ LIGHT ]";
    themeBtn.setAttribute("aria-pressed", String(state.light));
  });

  briefEditor.addEventListener("input", syncMailtoLink);

  copyBriefBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(briefEditor.value);
      showToast("Brief copied to clipboard");
    } catch {
      briefEditor.select();
      showToast("Select & copy brief manually");
    }
  });

  copyEmailBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(state.portfolio.email);
      showToast(`Copied ${state.portfolio.email}`);
    } catch {
      showToast(state.portfolio.email);
    }
  });

  const [shaderRes, dataRes] = await Promise.allSettled([
    fetch("./shader.glsl").then((r) => (r.ok ? r.text() : Promise.reject())),
    fetch("./portfolio.json").then((r) => (r.ok ? r.json() : Promise.reject()))
  ]);

  const shaderCode = shaderRes.status === "fulfilled" ? shaderRes.value : FALLBACK_SHADER;
  if (dataRes.status === "fulfilled") {
    state.portfolio = dataRes.value;
  }

  renderPortfolio();
  initPolyglotLab();
  initWebGL(shaderCode);
}

init();