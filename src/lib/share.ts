export interface ShareData {
  template: string;
  context: string;
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function encodeShareUrl(data: ShareData): string {
  const json = JSON.stringify({ t: data.template, c: data.context });
  const bytes = new TextEncoder().encode(json);
  const encoded = toBase64Url(bytes);
  const url = new URL(window.location.href.split("?")[0]);
  url.searchParams.set("s", encoded);
  return url.toString();
}

export function decodeShareParam(param: string): ShareData | null {
  try {
    const bytes = fromBase64Url(param);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);

    if (typeof parsed !== "object" || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;

    if (typeof obj.t !== "string" || typeof obj.c !== "string") return null;

    // Validate that context is valid JSON
    JSON.parse(obj.c);

    return { template: obj.t, context: obj.c };
  } catch {
    return null;
  }
}
