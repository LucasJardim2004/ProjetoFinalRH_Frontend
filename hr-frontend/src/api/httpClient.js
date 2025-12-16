const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:5001/api";

function buildUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = String(path ?? "").replace(/^\//, "");
  return `${base}/${normalizedPath}`;
}

export async function apiGet(path) {
  const url = buildUrl(path);
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const url = buildUrl(path);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed with status ${response.status}`);
  }

  return response.json();
}
