
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
  const contentType = response.headers.get("content-type") || "";

  let data = undefined;
  let rawText = "";

  // Prefer JSON when available, otherwise fall back to text
  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      rawText = await response.text();
      // If backend sends JSON but without content-type, try to parse it
      try {
        data = JSON.parse(rawText);
      } catch {
        // leave as text
      }
    }
  } catch {
    try {
      rawText = await response.text();
    } catch {
      rawText = "";
    }
  }

  const message =
    (data && typeof data === "object" && data.message) ||
    (typeof data === "string" ? data : null) ||
    rawText ||
    `API error (${response.status})`;

  const err = new Error(message);
  err.status = response.status;
  err.data = data;
  throw err;
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

// POST /api/v1/Employee
// Expects an EmployeeWithPersonDTO-like object:
// {
//   personType: "...",
//   firstName: "...",
//   lastName: "...",
//   employeeDTO: { ... }
// }
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


/**
 * CandidateInfo
 * Controller: CandidateInfoController
 * Route base: api/v1/CandidateInfo
 */
// GET /api/v1/CandidateInfo
export function getCandidateInfos() {
  return apiFetch("/CandidateInfo");
}

// GET /api/v1/CandidateInfo/{id}
export function getCandidateInfo(id) {
  return apiFetch(`/CandidateInfo/${id}`);
}

// GET /api/v1/CandidateInfo/by-opening/{openingId}
export function getCandidateInfosByOpening(openingId){
  return apiFetch(`/CandidateInfo/by-opening/${openingId}`);
}

// POST /api/v1/CandidateInfo
// Expects a CandidateInfoDTO-like object:
// {
//   // ID is generated by the backend; no need to send it
//   jobCandidateID: 0,       // optional: if you already have a JobCandidate
//   openingID: 123,          // opening this candidate is applying to
//   jobTitle: "...",
//   nationalID: "...",
//   birthDate: "2025-01-01T00:00:00" (or null),
//   maritalStatus: "...",
//   gender: "...",
//   firstName: "...",
//   middleName: "...",
//   lastName: "...",
//   email: "...",
//   phoneNumber: "...",
//   comment: "..."
// }
export function createCandidateInfo(candidateData) {
  return apiFetch("/CandidateInfo", {
    method: "POST",
    body: candidateData,
  });
}

// PATCH /api/v1/CandidateInfo/{id}
// Expects a CandidateInfoDTO-like object in the body,
// including JobCandidateID to satisfy backend validation.
export function updateCandidateInfo(id, candidatePartialDto) {
  return apiFetch(`/CandidateInfo/${id}`, {
    method: "PATCH",
    body: candidatePartialDto,
  });
}

// DELETE /api/v1/CandidateInfo/{id}
export function deleteCandidateInfo(id) {
  return apiFetch(`/CandidateInfo/${id}`, {
    method: "DELETE",
  });
}


/**
 * JobCandidate
 * Controller: JobCandidateController
 * Route base: api/v1/JobCandidate
 */

// GET /api/v1/JobCandidate
export function getJobCandidates() {
  return apiFetch("/JobCandidate");
}

// GET /api/v1/JobCandidate/{id}
export function getJobCandidate(id) {
  return apiFetch(`/JobCandidate/${id}`);
}

// POST /api/v1/JobCandidate
// Expects a JobCandidateDTO-like object:
// {
//   jobCandidateID: 0,          // optional, set by backend
//   businessEntityID: 0,        // if applicable
//   resume: "...",              // XML or text
//   resumeFile: "base64string"  // if using file storage
// }
export function createJobCandidate(candidateDto) {
  return apiFetch("/JobCandidate", {
    method: "POST",
    body: candidateDto,
  });
}

// UPLOAD CV for JobCandidate (multipart/form-data)
export async function uploadCandidateCv(file, nationalId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("nationalId", nationalId);

  const response = await fetch(`${API_BASE_URL}/JobCandidate/upload-cv`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unknown error";
    }
    throw new Error(`CV upload error (${response.status}): ${errorText}`);
  }

  return response.json(); // { fileName: "12345678.pdf" }
}

// PATCH /api/v1/JobCandidate/{id}
// Expects a JobCandidate-like object in the body,
// including JobCandidateID to satisfy backend validation.
export function updateJobCandidate(id, candidatePartial) {
  return apiFetch(`/JobCandidate/${id}`, {
    method: "PATCH",
    body: candidatePartial,
  });
}

// DELETE /api/v1/JobCandidate/{id}
export function deleteJobCandidate(id) {
  return apiFetch(`/JobCandidate/${id}`, {
    method: "DELETE",
  });
}

// Build a URL to download a candidate CV by file name
export function getCandidateCvUrl(fileName) {
  if (!fileName) return null;
  return `${API_BASE_URL}/JobCandidate/download-cv/${encodeURIComponent(
    fileName
  )}`;
}


/**
 * Employee
 * Controller: EmployeeControler
 * Route base: api/v1/Employee
 */
export async function getEmployee(id) {
  const data = await apiFetch(`/Employee/${id}`);
 
  const employeeCore =
    data?.Employee ??
    data?.employee ??
    {};
 
  const phoneNumber =
    data?.PhoneNumber ??
    data?.phoneNumber ??
    null;
 
  const emailAddress =
    data?.EmailAddress ??
    data?.emailAddress ??
    null;
 
  // Read histories from either the top level OR inside Employee
  const departmentHistoriesRaw =
    data?.EmployeeDepartmentHistories ??
    data?.employeeDepartmentHistories ??
    employeeCore?.EmployeeDepartmentHistories ??
    employeeCore?.employeeDepartmentHistories ??
    [];
 
  const payHistoriesRaw =
    data?.EmployeePayHistories ??
    data?.employeePayHistories ??
    employeeCore?.EmployeePayHistories ??
    employeeCore?.employeePayHistories ??
    [];
 
  const employeeDepartmentHistories = departmentHistoriesRaw.map(normalizeDeptHistory);
  const employeePayHistories = payHistoriesRaw.map(normalizePayHistory);
 
  return normalizeEmployee(employeeCore, {
    phoneNumber,
    emailAddress,
    employeeDepartmentHistories,
    employeePayHistories,
  });
}


/**
 * Return a PARTIAL camelCase patch so we don't wipe unrelated fields.
 */
export async function patchEmployee(id, partialDto) {
  const body = {
    BusinessEntityID: Number(id),
    ...partialDto,
  };
 
  const dto = await apiFetch(`/Employee/${id}`, {
    method: "PATCH",
    body,
  });
 
  // Build a partial result only for fields present in dto
  const has = (k) => Object.prototype.hasOwnProperty.call(dto || {}, k);
  const get = (...keys) => {
    for (const k of keys) {
      if (dto && dto[k] !== undefined) return dto[k];
    }
    return undefined;
  };
 
  const result = {};
  if (has("BusinessEntityID") || has("businessEntityID")) {
    result.businessEntityID = Number(get("BusinessEntityID", "businessEntityID"));
  }
  if (has("JobTitle") || has("jobTitle")) {
    result.jobTitle = get("JobTitle", "jobTitle");
  }
  if (has("Gender") || has("gender")) {
    result.gender = get("Gender", "gender");
  }
  if (has("MaritalStatus") || has("maritalStatus")) {
    result.maritalStatus = get("MaritalStatus", "maritalStatus");
  }
  if (has("BirthDate") || has("birthDate")) {
    result.birthDate = get("BirthDate", "birthDate");
  }
  if (has("HireDate") || has("hireDate")) {
    result.hireDate = get("HireDate", "hireDate");
  }
  // Note: we intentionally DO NOT include histories here to avoid wiping them.
 
  return result;
}


/**
 * PersonEmailAddress
 * Controller: PersonEmailAddressController
 * Route base: api/v1/PersonEmailAddress
 */ 
export async function patchEmail(id, emailAddress) {
  const body = {
    BusinessEntityID: Number(id),
    EmailAddress: emailAddress,
  };
  const dto = await apiFetch(`/PersonEmailAddress/${id}`, {
    method: "PATCH",
    body,
  });
  // Return a small object with the updated email casing
  const email =
    dto?.EmailAddress ??
    dto?.emailAddress ??
    emailAddress ??
    null;
  return { EmailAddress: email };
}
 

/**
 * EmployeeDepartmentHistory
 * Controller: EmployeeDepartmentHistoryController
 * Route base: api/v1/EmployeeDepartmentHistory
 */ 
export async function patchDepartmentHistoryEndDate(id, startDateOrRow, endDateYmd) {
  if (!endDateYmd) {
    throw new Error("EndDate cannot be empty.");
  }
 
  const encodedStart = encodeDateKeyForRoute(startDateOrRow);
 
  const body = {
    BusinessEntityID: Number(id),
    EndDate: endDateYmd, // date-only; server parses DateTime
  };
 
  const dto = await apiFetch(`/EmployeeDepartmentHistory/${id}_${encodedStart}`, {
    method: "PATCH",
    body,
  });
 
  return {
       departmentID: dto?.DepartmentID ?? dto?.departmentID,
    startDate: dto?.StartDate ?? dto?.startDate,
    endDate: dto?.EndDate ?? dto?.endDate ?? endDateYmd,
  };
}
 
export async function createDepartmentHistory(businessEntityID, departmentID, startDateYmd) {
  if (!businessEntityID) throw new Error("BusinessEntityID is required.");
  if (!Number.isInteger(departmentID) || departmentID < 1 || departmentID > 16) {
    throw new Error("DepartmentID must be an integer between 1 and 16.");
  }
 
  const body = {
    BusinessEntityID: Number(businessEntityID),
    DepartmentID: Number(departmentID),
    // If you want to let server default to now, omit StartDate below
    ...(startDateYmd ? { StartDate: startDateYmd } : {}),
    EndDate: null,
  };
 
  const dto = await apiFetch(`/EmployeeDepartmentHistory`, {
    method: "POST",
    body,
  });
 
  // Normalize to camelCase to match UI expectations
  return {
    departmentID: dto?.DepartmentID ?? dto?.departmentID ?? departmentID,
    startDate: dto?.StartDate ?? dto?.startDate ?? startDateYmd ?? new Date().toISOString(),
    endDate
  }
}
 
 
/**
 * EmployeePayHistory
 * Controller: EmployeePayHistoryController
 * Route base: api/v1/EmployeePayHistory
 */ 
export async function createPayHistory(businessEntityID, rate, payFrequency) {
  if (!businessEntityID) throw new Error("BusinessEntityID is required.");
  if (typeof rate !== "number" || !isFinite(rate) || rate <= 0) {
    throw new Error("Rate must be a positive number.");
  }
  if (![1, 2].includes(Number(payFrequency))) {
    throw new Error("PayFrequency must be 1 (Monthly) or 2 (Biweekly).");
  }
 
  const body = {
    BusinessEntityID: Number(businessEntityID),
    Rate: Number(rate),
    PayFrequency: Number(payFrequency),
    // RateChangeDate omitted so server defaults to now
  };
 
  const dto = await apiFetch(`/EmployeePayHistory`, {
    method: "POST",
    body,
  });
 
  // Normalize to camelCase for UI
  return {
    rateChangeDate: dto?.RateChangeDate ?? dto?.rateChangeDate ?? new Date().toISOString(),
    rate: dto?.Rate ?? dto?.rate ?? rate,
    payFrequency: dto?.PayFrequency ?? dto?.payFrequency ?? payFrequency,
  };
}

function normalizeDeptHistory(item = {}) {
  return {
    departmentID: item.DepartmentID ?? item.departmentID,
    startDate: item.StartDate ?? item.startDate,
    endDate: item.EndDate ?? item.endDate ?? null,
  };
}
 
function normalizePayHistory(item = {}) {
  return {
    rateChangeDate: item.RateChangeDate ?? item.rateChangeDate,
    rate: item.Rate ?? item.rate,
    payFrequency: item.PayFrequency ?? item.payFrequency,
  };
}
 
function normalizeEmployee(obj = {}, extras = {}) {
  const e = obj || {};
  return {
    businessEntityID: e.BusinessEntityID ?? e.businessEntityID ?? extras.businessEntityID,
    nationalIDNumber: e.NationalIDNumber ?? e.nationalIDNumber ?? extras.nationalIDNumber,
    jobTitle: e.JobTitle ?? e.jobTitle ?? extras.jobTitle,
    gender: e.Gender ?? e.gender ?? extras.gender,
    maritalStatus: e.MaritalStatus ?? e.maritalStatus ?? extras.maritalStatus,
    birthDate: e.BirthDate ?? e.birthDate ?? extras.birthDate,
    hireDate: e.HireDate ?? e.hireDate ?? extras.hireDate,
    phoneNumber: extras.phoneNumber ?? e.PhoneNumber ?? e.phoneNumber ?? null,
    emailAddress: extras.emailAddress ?? e.EmailAddress ?? e.emailAddress ?? null,
    employeeDepartmentHistories:
      extras.employeeDepartmentHistories ??
      e.EmployeeDepartmentHistories ??
      e.employeeDepartmentHistories ??
      [],
    employeePayHistories:
      extras.employeePayHistories ??
      e.EmployeePayHistories ??
      e.employeePayHistories ??
      [],
  };
}export async function me() {
  return apiFetch("/Auth/me"); // expects Authorization header added in apiFetch
}