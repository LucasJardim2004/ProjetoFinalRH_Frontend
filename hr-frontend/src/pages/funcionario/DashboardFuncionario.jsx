import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import {
  getEmployee,
  patchEmployee,
  patchEmail,
  patchDepartmentHistoryEndDate,
  createDepartmentHistory,
  createPayHistory,
  replacePhoneNonAtomic as replacePhoneApi
} from "../../services/apiClient";
import "./dashboardFuncionario.css";
import "ag-grid-community/styles/ag-grid.css";
import { useAuth } from "/src/AuthProvider.jsx";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]); 
import { AgGridReact } from "ag-grid-react";

const myTheme = themeQuartz.withParams({
  spacing: 6,
  headerTextColor: "#333",
  accentColor: "#0E74A1",
});

function toLocalYmd(dateLike) {
  if (!dateLike) return "";
  const d = normalizeToDate(dateLike);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


const DISPLAY_LOCALE = "pt-PT";

    function validateEndDate(d, data) {
      // 1) Forbid clearing
      if (!d) return "Clearing EndDate is not supported.";

      // 2) Ensure valid date
      const endDate = normalizeToDate(d);
      if (!isValidDate(endDate)) return "End date is invalid.";

      // 3) Compare to start date if present
      const startRaw = data?.startDate ?? data?.StartDate ?? null;
      if (startRaw) {
        const startDate = normalizeToDate(startRaw);
        if (isValidDate(startDate)) {
          const s = toLocalYmd(startDate); // "YYYY-MM-DD"
          const e = toLocalYmd(endDate);   // "YYYY-MM-DD"
          if (s && e && e < s) {
            return "End date cannot be before start date.";
          }
        }
      }
      return null;
    }

function formatDate(value, locale = DISPLAY_LOCALE) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(locale);
}
function formatMaritalStatus(code) {
  if (!code) return "—";
  const c = String(code).toUpperCase();
  if (c === "M") return "Married";
  if (c === "S") return "Single";
  return code;
}
function formatGender(code) {
  if (!code) return "—";
  const c = String(code).toUpperCase();
  if (c === "M") return "Male";
  if (c === "F") return "Female";
  return code;
}
function formatPayFrequency(value) {
  if (value === 1) return "Monthly";
  if (value === 2) return "Biweekly";
  return value != null ? String(value) : "—";
}

function toISODateOnly(date) {
  if (!date) return "";
  if (typeof date === "string") return date; // already in correct format
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function fromDateInput(value) {
  if (!value) return null;
  return new Date(value); // converts "YYYY-MM-DD" back to Date
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

// Turns "YYYY-MM-DD" (or Date-like) into a Date at local midnight.
function normalizeToDate(dateLike) {
  if (!dateLike) return null;
  if (dateLike instanceof Date) return new Date(dateLike.getTime());
  if (typeof dateLike === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateLike);
    if (match) return new Date(+match[1], +match[2] - 1, +match[3]);
    const parsed = new Date(dateLike);
    return isValidDate(parsed) ? parsed : null;
  }
  return null;
}


function EditIconButton({ onClick, title = "Edit" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="edit-icon-btn"
      style={{
        marginLeft: 8,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      ✏️
    </button>
  );
}


function EditableField({
  label,
  value,
  renderValue,
  type = "text",
  options = [],
  onSave,
  disabled = false,
  parse,
  validate,
}) {
  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(value ?? "");
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setLocal(value ?? "");
  }, [value]);

  function startEdit() {
    if (disabled || saving) return; // Prevent editing if disabled
    setError(null);
    setLocal(value ?? "");
    setEditing(true);
  }

  async function commit() {
    setError(null);
    const raw = local;
    const finalValue = parse ? parse(raw) : raw;

    if (validate) {
      const msg = validate(finalValue);
      if (msg) {
        setError(msg);
        return;
      }
    }

    try {
      setSaving(true);
      await onSave(finalValue);
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setError(null);
    setLocal(value ?? "");
    setEditing(false);
  }

  const unchanged =
    (type === "date"
      ? (value?.getTime?.() || value) === (local?.getTime?.() || local)
      : value === local);

  return (
    <div className="detail-item">
      <span className="label">{label}</span>
      <div className="value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!editing ? (
          <>
            <span>{renderValue ? renderValue(value) : (value ?? "—")}</span>
            {!disabled && (
              <EditIconButton onClick={startEdit} title={`Edit ${label}`} />
            )}
          </>
        ) : (
          <>
            {type === "text" && (
              <input
                type="text"
                value={local ?? ""}
                onChange={(e) => setLocal(e.target.value)}
                style={{ flex: 1, padding: 6 }}
                disabled={saving || disabled}
              />
            )}

            {type === "date" && (
              <input
                type="date"
                value={toISODateOnly(local)}
                onChange={(e) => setLocal(fromDateInput(e.target.value))}
                disabled={saving || disabled}
              />
            )}

            {type === "select" && (
              <select
                value={local ?? ""}
                onChange={(e) => setLocal(e.target.value)}
                disabled={saving || disabled}
              >
                <option value="" disabled>Select…</option>
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={commit}
              disabled={saving || unchanged || disabled}
              className="btn btn-primary"
              style={{ marginLeft: 8 }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="btn btn-secondary"
              style={{ marginLeft: 4 }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
      {error && (
        <div style={{ color: "red", marginTop: 4, fontSize: 12 }} aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
}


function DeptEndDateCellRenderer(props) {
  const { value, data, onSaveEndDate, api } = props;
  const user = useAuth().user;

  const initialDate = React.useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [editing, setEditing] = React.useState(false);
  const [local, setLocal] = React.useState(initialDate);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLocal(initialDate);
  }, [initialDate]);

  function startEdit() {
    if (saving) return;
    setError(null);
    setLocal(initialDate);
    setEditing(true);
  }

  function cancel() {
    setError(null);
    setLocal(initialDate);
    setEditing(false);
  }





  const unchanged = React.useMemo(() => {
    return toISODateOnly(initialDate) === toISODateOnly(local);
  }, [initialDate, local]);

  async function commit() {
    setError(null);
    const d = local;
    const msg = validateEndDate(d);
    if (msg) {
      setError(msg);
      return;
    }
    try {
      setSaving(true);
      await onSaveEndDate?.(data, d);
      setEditing(false);
      api?.refreshCells?.({ force: true });
    } catch (e) {
      setError(e?.message || "Failed to save EndDate");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {!editing ? (
        <>
          <span>{formatDate(value, DISPLAY_LOCALE)}</span>
          {user?.roles?.[0] === "HR" && (
          <EditIconButton onClick={startEdit} title="Edit End" />
          )}
        </>
      ) : (
        <>
          <input
            type="date"
            value={toISODateOnly(local)}
            onChange={(e) => setLocal(fromDateInput(e.target.value))}
            disabled={saving}
            style={{ padding: 4 }}
          />
          <button
            type="button"
            onClick={commit}
            disabled={saving || unchanged}
            className="btn btn-primary"
            style={{ padding: "2px 8px" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="btn btn-secondary"
            style={{ padding: "2px 8px" }}
          >
            Cancel
          </button>
          {error && (
            <span style={{ color: "red", fontSize: 12, marginLeft: 6 }} aria-live="polite">
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function AddDeptMovementModal({
  isOpen,
  onClose,
  onConfirm,
  defaultStartDate = null,
  existingRows = [],
}) {
  const [deptId, setDeptId] = React.useState("");
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [startDate, setStartDate] = React.useState(defaultStartDate ?? new Date());

  React.useEffect(() => {
    if (isOpen) {
      setDeptId("");
      setError(null);
      setSaving(false);
      setStartDate(defaultStartDate ?? new Date());
    }
  }, [isOpen, defaultStartDate]);

  function validate() {
    const n = Number(deptId);
    if (!Number.isInteger(n)) return "DepartmentID must be an integer.";
    if (n < 1 || n > 16) return "DepartmentID must be between 1 and 16.";
    if (!isValidDate(startDate)) return "Start Date is invalid.";

    const startYmd = toISODateOnly(startDate);
    const dup = existingRows.some(
      (r) =>
        String(r.departmentID) === String(n) &&
        toISODateOnly(r.startDate) === startYmd
    );
    if (dup) return "A movement with this DepartmentID and Start Date already exists.";
    return null;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    try {
      setSaving(true);
      await onConfirm(Number(deptId), startDate);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to create department movement.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="add-dept-title"
      className="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card"
        style={{ background: "#fff", padding: 16, borderRadius: 8, minWidth: 320, boxShadow: "0 10px 24px rgba(0,0,0,0.2)" }}>
        <h3 id="add-dept-title" style={{ marginTop: 0, marginBottom: 12 }}>Add Department Movement</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Department ID (1–16)</span>
              <input type="number" min={1} max={16} inputMode="numeric" value={deptId} onChange={(e) => setDeptId(e.target.value)} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Start Date</span>
              <input type="date" value={toISODateOnly(startDate)} onChange={(e) => setStartDate(fromDateInput(e.target.value))} />
            </label>
            {error && <div style={{ color: "red", fontSize: 12 }} aria-live="polite">{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !deptId}>{saving ? "Adding…" : "Add"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddPayHistoryModal({
  isOpen,
  onClose,
  onConfirm, 
}) {
  const [rate, setRate] = React.useState("");
  const [payFreq, setPayFreq] = React.useState("1"); // 1=Monthly, 2=Biweekly
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRate("");
      setPayFreq("1");
      setError(null);
      setSaving(false);
    }
  }, [isOpen]);

  function validate() {
    const r = Number(rate);
    const f = Number(payFreq);
    if (!isFinite(r) || r <= 0) return "Rate must be a positive number.";
    if (![1, 2].includes(f)) return "Pay Frequency must be 1 (Monthly) or 2 (Biweekly).";
    return null;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    try {
      setSaving(true);
      await onConfirm(Number(rate), Number(payFreq));
      onClose(); 
    } catch (err) {
      setError(err?.message || "Failed to add pay history.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="add-pay-title"
      className="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card"
        style={{ background: "#fff", padding: 16, borderRadius: 8, minWidth: 320, boxShadow: "0 10px 24px rgba(0,0,0,0.2)" }}>
        <h3 id="add-pay-title" style={{ marginTop: 0, marginBottom: 12 }}>
          Add Pay History
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Rate (€)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span>Pay Frequency</span>
              <select value={payFreq} onChange={(e) => setPayFreq(e.target.value)}>
                <option value="1">Monthly</option>
                <option value="2">Biweekly</option>
              </select>
            </label>

            {error && (
              <div style={{ color: "red", fontSize: 12 }} aria-live="polite">
                {error}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving || !rate}>
                {saving ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const GENDER_OPTS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];
const MARITAL_OPTS = [
  { value: "M", label: "Married" },
  { value: "S", label: "Single" },
];




/* FUNÇÃO DASHBOARD */
export default function DashboardFuncionario() {
  const { businessEntityID } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emp, setEmp] = useState(null);

  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddPayModal, setShowAddPayModal] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const isHR = roles[0] === "HR";

  const paramId = businessEntityID ? Number(businessEntityID) : null;
  const ownId = user?.businessEntityID ? Number(user.businessEntityID) : null;

  const effectiveId = isHR ? (paramId || ownId) : ownId;

  // Reload helper
  const reloadEmployee = React.useCallback(async () => {
    if (!effectiveId){
      throw new Error("Erro");
    }
    const employee = await getEmployee(effectiveId);
    setEmp(employee);
  }, [effectiveId]);

  useEffect(() => {
    if (authLoading){
      setLoading(true);
      return;
    }
    (async function run() {
      try {
        setLoading(true);
        setError(null);
        await reloadEmployee();
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, reloadEmployee]);

  async function saveJobTitle(newValue) {
    const updated = await patchEmployee(emp.businessEntityID, {
      JobTitle: newValue?.trim() || null,
    });
    setEmp((prev) => ({ ...prev, ...updated }));
  }
  async function saveGender(newValue) {
    const v = String(newValue).toUpperCase();
    if (!["M", "F"].includes(v)) throw new Error("Invalid Gender (M/F).");
    const updated = await patchEmployee(emp.businessEntityID, { Gender: v });
    setEmp((prev) => ({ ...prev, ...updated }));
  }
  async function saveMaritalStatus(newValue) {
    const v = String(newValue).toUpperCase();
    if (!["M", "S"].includes(v)) throw new Error("Invalid Marital Status (M/S).");
    const updated = await patchEmployee(emp.businessEntityID, { MaritalStatus: v });
    setEmp((prev) => ({ ...prev, ...updated }));
  }
  async function saveBirthDate(newDate) {
    if (newDate && !isValidDate(newDate)) throw new Error("Birth date is invalid.");
    const bodyDate = newDate ? toISODateOnly(newDate) : null;
    const updated = await patchEmployee(emp.businessEntityID, { BirthDate: bodyDate });
    setEmp((prev) => ({ ...prev, ...updated }));
  }
  async function saveHireDate(newDate) {
    if (newDate && !isValidDate(newDate)) throw new Error("Hire date is invalid.");
    const bodyDate = newDate ? toISODateOnly(newDate) : null;
    const updated = await patchEmployee(emp.businessEntityID, { HireDate: bodyDate });
    setEmp((prev) => ({ ...prev, ...updated }));
  }
  async function saveEmail(newEmail) {
    if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      throw new Error("Invalid email format.");
    }
    const dto = await patchEmail(emp.businessEntityID, newEmail || null);
    setEmp((prev) => ({ ...prev, emailAddress: dto?.EmailAddress ?? newEmail ?? null }));
  }



async function savePhone(newPhone) {
  const oldPhone = emp.phoneNumber; // current value from DB
  const newPhoneTrimmed = (newPhone ?? "").trim();
  // Use the type that came from the API; fallback to 1 only if null
  const typeId = Number.isInteger(emp.phoneNumberTypeID) ? emp.phoneNumberTypeID : 1;

  console.log("[Dashboard.savePhone] replacing:", {
    businessEntityID: emp.businessEntityID,
    oldPhone,
    newPhone: newPhoneTrimmed,
    phoneNumberTypeID: typeId,
  });

  await replacePhoneApi(emp.businessEntityID, oldPhone, newPhoneTrimmed, typeId);
  await reloadEmployee();
}



  /* Dept EndDate (renderer) */

  const onSaveDepartmentEndDate = React.useCallback(async (rowData, newDate) => {
    // Normalize first
    const endDate = normalizeToDate(newDate);
    if (!isValidDate(endDate)) {
      throw new Error("End date is invalid.");
    }

    // Build YYYY-MM-DD (local) for backend
    const endYmd = toLocalYmd(endDate);
    if (!endYmd) throw new Error("Unable to convert end date.");

    // Optional: run the same validation here for safety
    const v = validateEndDate(endDate, rowData);
    if (v) throw new Error(v);

    await patchDepartmentHistoryEndDate(
      Number(emp.businessEntityID),
      rowData,
      endYmd
    );
    await reloadEmployee();
  }, [emp?.businessEntityID, reloadEmployee]);


  /* Create Department Movement */

  const handleAddDepartmentMovement = React.useCallback(async (departmentID, startDate) => {
    const startYmd = toISODateOnly(startDate);
    const histories = emp?.employeeDepartmentHistories ?? [];

    
    const hasOpenMovement = histories.some((h) => {
      const end = h.endDate;
      return end == null || (typeof end === "string" && end.trim() === "");
    });

    if (hasOpenMovement) {
      // IMPORTANT: throw, do NOT return a string
      throw new Error("There's already an open movement. Close it before adding a new one.");
    }



    // Guard 2: duplicate prevention (same departmentID and startDate)
    const startDupExists = histories.some(
      (r) =>
        String(r.departmentID) === String(departmentID) &&
        toISODateOnly(r.startDate) === startYmd
    );

    if (startDupExists) {
      throw new Error("A movement with this DepartmentID and Start Date already exists.");
    }

    
    await createDepartmentHistory(emp.businessEntityID, departmentID, startYmd);

    // Option A: server is source of truth — refresh canonical data
    await reloadEmployee();

    // ✅ Close modal AFTER success
    setShowAddDeptModal(false);
  },
  [emp?.businessEntityID, emp?.employeeDepartmentHistories, reloadEmployee]
);



  /* Create Pay History (Rate + Frequency only; server sets RateChangeDate = now) */
  const handleAddPayHistory = React.useCallback(async (rate, payFrequency) => {
    setShowAddPayModal(false);
    await createPayHistory(emp.businessEntityID, rate, payFrequency);
    await reloadEmployee();
  }, [emp?.businessEntityID, reloadEmployee]);

  /* AG Grid configuration */
  const defaultColDef = useMemo(() => ({
    sortable: false,
    filter: false,
    resizable: true,
    flex: 1,
    editable: false,
    minWidth: 140
  }), []);


// DashboardFuncionario.jsx
const deptCols = useMemo(() => [
  { field: "departmentID", headerName: "Department ID", maxWidth: 140 },
  {
    headerName: "Department",
    valueGetter: (p) => p.data?.departmentName ?? `#${p.data?.departmentID ?? "—"}`,
    flex: 1,
    minWidth: 180,
  },
  { field: "startDate", headerName: "Start", valueFormatter: (p) => formatDate(p.value, DISPLAY_LOCALE)},
  {
    field: "endDate",
    headerName: "End",
    cellRenderer: DeptEndDateCellRenderer,
    cellRendererParams: { onSaveEndDate: onSaveDepartmentEndDate },
  },
  { headerName: "Status", valueGetter: (p) => (p.data?.endDate ? "Previous" : "Current")},
], [onSaveDepartmentEndDate]);


  const payCols = useMemo(() => [
    { field: "rateChangeDate", headerName: "Rate Change Date", valueFormatter: (p) => formatDate(p.value, DISPLAY_LOCALE)},
    {
      field: "rate",
      headerName: "Rate (€/hour)",
      valueFormatter: (p) =>
        typeof p.value === "number"
          ? p.value.toLocaleString(DISPLAY_LOCALE, { style: "currency", currency: "EUR" })
          : "—",
    },
    { field: "payFrequency", headerName: "Frequency", valueFormatter: (p) => formatPayFrequency(p.value)},
  ], []);

  const deptRowClassRules = useMemo(() => ({
    "row-current": (params) => !params.data?.endDate,
  }), []);

  
const currentDepartment = useMemo(() => {
  const histories = emp?.employeeDepartmentHistories ?? [];
  if (!histories.length) return null;

  // Filter for open (endDate == null)
  const open = histories.filter(h => !h.endDate);
  if (open.length) {
    // If multiple, pick the one with latest startDate
    return open.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0].departmentName ?? null;
  }

  // If no open, fallback to most recent by startDate
  const latest = histories.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
  return latest?.departmentName ?? null;
}, [emp]);


  console.log(emp);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Employee Details</h1>
          <p className="vagas-subtitle">
            General data and email are editable. Department history EndDate is editable per row.
          </p>
        </div>
      </div>

      <div className="vagas-card">
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading && !error && emp && (
          <>
            {/* General Info */}
            <section className="employee-details-section">
              <h2 className="section-title">General Information</h2>

              
              <div className="detail-item">
                <span className="label">Name</span>
                <span className="value">{emp.firstName + " " + emp.lastName ?? "—"}</span>
              </div>

              <div className="detail-item">
                <span className="label">Department</span>
                <span className="value">{currentDepartment}</span>
              </div>

              <div className="employee-details-grid">
                <div className="detail-item">
                  <span className="label">ID</span>
                  <span className="value">{emp.businessEntityID ?? "—"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">National ID Number</span>
                  <span className="value">{emp.nationalIDNumber ?? "—"}</span>
                </div>

                <EditableField label="Job Title" value={emp.jobTitle ?? ""} onSave={saveJobTitle} type="text" disabled={user?.roles?.[0] !== "HR"}/>
                <EditableField label="Gender" value={emp.gender ?? ""} renderValue={(v) => formatGender(v)} type="select" options={[
                  { value: "M", label: "Male" }, { value: "F", label: "Female" },
                ]} onSave={saveGender} />
                <EditableField label="Marital Status" value={emp.maritalStatus ?? ""} renderValue={(v) => formatMaritalStatus(v)} type="select" options={[
                  { value: "M", label: "Married" }, { value: "S", label: "Single" },
                ]} onSave={saveMaritalStatus} /> 
                <EditableField
                  label="Birth Date"
                  value={emp.birthDate ? new Date(emp.birthDate) : null}
                  renderValue={(v) => formatDate(v, DISPLAY_LOCALE)}
                  type="date"
                  onSave={saveBirthDate}
                  parse={(d) => d}
                  validate={(d) => (d && !isValidDate(d) ? "Birth date is invalid." : null)}
                  disabled={user?.roles?.[0] !== "HR"} // <-- Non-HR users cannot edit
                />

                <EditableField label="Hire Date" value={emp.hireDate ? new Date(emp.hireDate) : null} renderValue={(v) => formatDate(v, DISPLAY_LOCALE)} type="date" onSave={saveHireDate} parse={(d) => d} validate={(d) => (d && !isValidDate(d) ? "Hire date is invalid." : null)} disabled={user?.roles?.[0] !== "HR"} />
                <EditableField label="Email" value={emp.emailAddress ?? ""} type="text" validate={(v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email format" : null} onSave={saveEmail} />
                
                
                <EditableField
                  label="Phone"
                  value={emp.phoneNumber ?? ""}
                  type="text"
                  validate={(v) =>
                    v && !/^[+0-9()\-.\s]{6,25}$/.test(v) ? "Invalid phone format" : null
                  }
                  onSave={savePhone}
                />
              </div>
            </section>

            {/* Department History */}
            <section className="employee-details-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 className="section-title">Department History</h2>
                {user?.roles?.[0] === "HR" && (
                  <button type="button" className="btn btn-primary" onClick={() => setShowAddDeptModal(true)}>
                  + Add Movement
                </button>
                )}
              </div>
              <div className="vagas-grid-wrapper">
                <AgGridReact
                  rowData={emp.employeeDepartmentHistories ?? []}
                  columnDefs={deptCols}
                  defaultColDef={defaultColDef}
                  theme={myTheme}
                  animateRows={true}
                  rowClassRules={deptRowClassRules}
                  rowHeight={64} 
                  headerHeight={40}
                  pagination={false}
                  paginationPageSize={10}
                  style={{ height: "400px" }}
                />
              </div>
            </section>

            {/* Pay History */}
            <section className="employee-details-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 className="section-title">Pay History</h2>
                {user?.roles?.[0] === "HR" && (
                <button type="button" className="btn btn-primary" onClick={() => setShowAddPayModal(true)}>
                  + Add Pay Change
                </button>
                )}
              </div>
              <div className="vagas-grid-wrapper">
                <AgGridReact
                  rowData={emp.employeePayHistories ?? []}
                  columnDefs={payCols}
                  defaultColDef={defaultColDef}
                  theme={myTheme}
                  animateRows={true}
                  rowHeight={40}
                  headerHeight={40}
                  pagination={false}
                  paginationPageSize={10}
                  domLayout="autoHeight"
                />
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      <AddDeptMovementModal
        isOpen={showAddDeptModal}
        onClose={() => setShowAddDeptModal(false)}
        onConfirm={handleAddDepartmentMovement}
        defaultStartDate={new Date()}
        existingRows={emp?.employeeDepartmentHistories ?? []}
      />

      <AddPayHistoryModal
        isOpen={showAddPayModal}
        onClose={() => setShowAddPayModal(false)}
        onConfirm={handleAddPayHistory}  // only rate & frequency (server sets date)
      />
    </div>
  );
}