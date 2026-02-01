export interface PlaygroundExport {
  version: number;
  template: string;
  context: Record<string, unknown>;
  metadata?: { exportedAt: string };
}

export type ImportResult =
  | { success: true; template: string; contextJson: string }
  | { success: false; error: string };

export function createExportData(template: string, contextJson: string): PlaygroundExport | null {
  try {
    const context = JSON.parse(contextJson) as Record<string, unknown>;
    return {
      version: 1,
      template,
      context,
      metadata: { exportedAt: new Date().toISOString() }
    };
  } catch {
    return null;
  }
}

export function parseImportData(content: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { success: false, error: "Invalid JSON file" };
  }

  if (typeof data !== "object" || data === null) {
    return { success: false, error: "Invalid file format: expected an object" };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== "number") {
    return { success: false, error: "Invalid file format: missing version" };
  }

  if (obj.version !== 1) {
    return { success: false, error: `Unsupported file version: ${obj.version}` };
  }

  if (typeof obj.template !== "string") {
    return { success: false, error: "Invalid file format: missing template" };
  }

  if (typeof obj.context !== "object" || obj.context === null) {
    return { success: false, error: "Invalid file format: missing context" };
  }

  return {
    success: true,
    template: obj.template,
    contextJson: JSON.stringify(obj.context, null, 2)
  };
}

export function downloadPlaygroundFile(template: string, contextJson: string): boolean {
  const data = createExportData(template, contextJson);
  if (!data) {
    return false;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tera-playground-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

export function openFileDialog(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const content = await file.text();
        resolve(content);
      } catch {
        resolve(null);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}
