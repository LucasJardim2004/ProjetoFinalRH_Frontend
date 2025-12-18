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
  });
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
