let pyodide = null;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("✅ Pyodide loaded.");
}

async function runPythonStep(b, w) {
  const code = `
b = ${b}
w = ${w}
db = b * 0.1 - 0.01 * b * w
dw = -w * 0.1 + 0.005 * b * w
b += db
w += dw
(b, w)
  `;
  const result = await pyodide.runPythonAsync(code);
  return JSON.parse(result.replace('(', '[').replace(')', ']')); // crude tuple parsing
}
