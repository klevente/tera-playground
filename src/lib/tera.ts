export type TeraVersion = "v1" | "v2";

export interface TeraWasm {
  render_v1(template: string, context_json: string): string;
  render_v2(template: string, context_json: string): string;
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
  contextJson: string,
  version: TeraVersion = "v1"
): { output: string } | { error: string } {
  if (!wasmModule) {
    return { error: "WASM module not initialized" };
  }

  try {
    const output =
      version === "v1"
        ? wasmModule.render_v1(template, contextJson)
        : wasmModule.render_v2(template, contextJson);
    return { output };
  } catch (e) {
    return { error: String(e) };
  }
}
