const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5266/api/v1";//A verificar

  async function apiFetch(path, options = {}) {// Função Genérica para fazer requisições à API
  const url = `${API_BASE_URL}${path}`;

  const { method = "GET", body, headers } = options;

  const response = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unknown error";
    }
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * OPENINGS (vagas)
 * Controller: OpeningController
 * Route base: api/v1/Opening
 */

// GET /api/v1/Opening
export function getOpenings() {
  return apiFetch("/Opening");
}

// GET /api/v1/Opening/{id}
export function getOpening(id) {
  return apiFetch(`/Opening/${id}`);
}

// POST /api/v1/Opening
export function createOpening(openingData) {
  return apiFetch("/Opening", {
    method: "POST",
    body: openingData,
  });
}

// PATCH /api/v1/Opening/{id}
export function updateOpening(id, partialData) {
  return apiFetch(`/Opening/${id}`, {
    method: "PATCH",
    body: partialData,
  });
}

// DELETE /api/v1/Opening/{id}
export function deleteOpening(id) {
  return apiFetch(`/Opening/${id}`, {
    method: "DELETE",
  });
}

