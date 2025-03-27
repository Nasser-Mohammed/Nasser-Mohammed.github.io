let pyodide = null;
let initialized = false;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("✅ Pyodide loaded.");

  const pythonCode = `
def update(b, w):
    db = b * 0.1 - 0.01 * b * w
    dw = -w * 0.1 + 0.005 * b * w
    return b + db, w + dw
`;
  await pyodide.runPythonAsync(pythonCode);
  initialized = true;
}

async function runPythonStep(b, w) {
  if (!initialized) await loadPyodideAndPackages();

  pyodide.globals.set("b", b);
  pyodide.globals.set("w", w);

  const result = pyodide.runPython(`update(b, w)`);
  return JSON.parse(result.toString().replace("(", "[").replace(")", "]"));
}