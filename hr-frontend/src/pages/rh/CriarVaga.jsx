// src/pages/rh/CriaVaga.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOpening } from "../../services/apiClient";
import "./CriarVaga.css";

function CriaVaga() {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedTitle = jobTitle.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Job Title is required.");
      return;
    }

    if (trimmedTitle.length > 50) {
      setError("Job Title must have at most 50 characters.");
      return;
    }

    if (trimmedDescription.length > 256) {
      setError("Description must have at most 256 characters.");
      return;
    }

    const payload = {
      jobTitle: trimmedTitle,
      description: trimmedDescription || null,
    };

    try {
      setSubmitting(true);
      await createOpening(payload);
      setSuccessMsg("Opening created successfully.");
      setJobTitle("");
      setDescription("");
      navigate("/vagas");
    } catch (err) {
      setError("Error creating opening: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClear() {
    setJobTitle("");
    setDescription("");
    setError(null);
    setSuccessMsg(null);
  }

  return (
    <div className="criar-vaga-page">
      <div className="criar-vaga-card">
        <header className="criar-vaga-header">
          <h1>Create opening</h1>
          <p>
            Fill in the details below to create a new job opening.
          </p>
        </header>

        {error && <div className="criar-vaga-alert criar-vaga-alert-error">{error}</div>}
        {successMsg && (
          <div className="criar-vaga-alert criar-vaga-alert-success">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="criar-vaga-form">
          <div className="criar-vaga-form-group">
            <label htmlFor="jobTitle">
              Job Title <span className="required">*</span>
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Software Developer"
              maxLength={50}
              required
            />
            <small className="field-help">Maximum 50 characters.</small>
          </div>

          <div className="criar-vaga-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the role, responsibilities or requirements."
              maxLength={256}
            />
            <small className="field-help">
              Maximum 256 characters. Optional.
            </small>
          </div>

          <div className="criar-vaga-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Create opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CriaVaga;