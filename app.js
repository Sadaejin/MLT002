let pyodideInstance = null;

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
    statusEl.textContent = "OFFLINE / FALLBACK";
    consoleEl.textContent = `// Push repo to GitHub Pages to fetch analytics.py over HTTPS.\n// Error: ${err.message}`;
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