export interface TeraWasm {
  render(template: string, context_json: string): string;
}

let wasmModule: TeraWasm | null = null;

export async function initTera(): Promise<TeraWasm> {
  if (wasmModule) {
    return wasmModule;
  }

  const wasm = await import("./wasm/tera_wasm.js");
  await wasm.default();
  wasmModule = wasm as unknown as TeraWasm;
  return wasmModule;
}

export function renderTemplate(
  template: string,
  contextJson: string
): { output: string } | { error: string } {
  if (!wasmModule) {
    return { error: "WASM module not initialized" };
  }

  try {
    const output = wasmModule.render(template, contextJson);
    return { output };
  } catch (e) {
    return { error: String(e) };
  }
}
