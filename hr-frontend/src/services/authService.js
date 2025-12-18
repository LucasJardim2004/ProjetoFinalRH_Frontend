
// authService.js
const STORAGE_KEY = "rh.auth"; // onde guardamos tokens no localStorage

function getState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getAccessToken() {
  return getState()?.accessToken || null;
}

export function getRefreshToken() {
  return getState()?.refreshToken || null;
}

export function setTokens({ accessToken, refreshToken }) {
  const current = getState() || {};
  saveState({
    ...current,
    accessToken,
    refreshToken,
    // opcional: guardar payload decodificado para UI
    // user: decodeJwt(accessToken),
  });
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

// Utilitário opcional: decodificar JWT (sem validar assinatura)
export function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
