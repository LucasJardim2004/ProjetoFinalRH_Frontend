
// /src/services/apiClient.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5266/api/v1";

// ---------- Auth store ----------
export const AUTH_STORAGE_KEY = "rh.auth";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}
function setAuth(next) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
}
function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken() {
  return getAuth()?.accessToken || null;
}
export function getRefreshToken() {
  return getAuth()?.refreshToken || null;
}
export function setTokens({ accessToken, refreshToken }) {
  const current = getAuth() || {};
  setAuth({ ...current, accessToken, refreshToken });
}

// ---------- low-level fetch ----------
async function rawFetch(url, options) {
  return fetch(url, options);
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/Auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  // { accessToken, refreshToken }
  const data = await res.json();
  setTokens(data);
  return true;
}

// ---------- generic API fetch ----------
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const { method = "GET", body, headers } = options;

  const token = getAccessToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  let response = await rawFetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...authHeader,
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try refresh on 401 and retry once
  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryToken = getAccessToken();
      const retryAuthHeader = retryToken
        ? { Authorization: `Bearer ${retryToken}` }
        : {};
      response = await rawFetch(url, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...retryAuthHeader,
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      clearAuth();
    }
  }

  if (!response.ok) {
    let errorText = "Unknown error";
    try {
      errorText = await response.text();
    } catch {
      // ignore
    }
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ---------- business endpoints ----------
export function getOpenings() {
  return apiFetch("/Opening");
}
export function getOpening(id) {
  return apiFetch(`/Opening/${id}`);
}
export function createOpening(openingData) {
  return apiFetch("/Opening", { method: "POST", body: openingData });
}
export function updateOpening(id, partialData) {
  return apiFetch(`/Opening/${id}`, { method: "PATCH", body: partialData });
}
export function deleteOpening(id) {
  return apiFetch(`/Opening/${id}`, { method: "DELETE" });
}

// ---------- employees ----------
export function getEmployees() {
  return apiFetch("/Employee");
}
export function getEmployee(id) {
  return apiFetch(`/Employee/${id}`);
}
export function createEmployee(employeeWithPersonData) {
  return apiFetch("/Employee", { method: "POST", body: employeeWithPersonData });
}
export function updateEmployee(id, employeePartialDto) {
  return apiFetch(`/Employee/${id}`, { method: "PATCH", body: employeePartialDto });
}

// ---------- auth ----------
export async function login(email, password) {
  const data = await apiFetch("/Auth/login", {
    method: "POST",
    body: { email, password },
  });
  // Expect { accessToken, refreshToken }
  setTokens(data);
  return data;
}

export async function register(payload) {
  const data = await apiFetch("/Auth/register", { method: "POST", body: payload });
  setTokens(data);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiFetch("/Auth/logout", { method: "POST", body: { refreshToken } });
    } catch (err) {
      // ignore server errors on logout, still clear locally
      console.warn("Logout API failed:", err?.message);
    }
   }
  clearAuth();
}

export async function me() {
  return apiFetch("/Auth/me"); // expects Authorization header added in apiFetch
}