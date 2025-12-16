import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateOpening } from "../../services/apiClient";
import "./CriarVaga.css";

function EditarVaga() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dados vindos do navigate em Vagas.jsx
  const { openingId, jobTitle: initialJobTitle, description: initialDescription } =
    location.state || {};

  const [jobTitle, setJobTitle] = useState(initialJobTitle || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(
    !openingId ? "No opening selected to edit." : null
  );
  const [successMsg, setSuccessMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!openingId) {
      setError("No opening selected to edit.");
      return;
    }

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
      openingID: openingId, 
      jobTitle: trimmedTitle,
      description: trimmedDescription || null,
    };

    try {
      setSubmitting(true);
      await updateOpening(openingId, payload);
      setSuccessMsg("Opening updated successfully.");

      setTimeout(() => {
        navigate("/vagas");
      }, 800);
    } catch (err) {
      setError("Error updating opening: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/vagas");
  }

  return (
    <div className="criar-vaga-page">
      <div className="criar-vaga-card">
        <header className="criar-vaga-header">
          <h1>Edit opening</h1>
          <p>Update the details of the selected job opening.</p>
        </header>

        {error && (
          <div className="criar-vaga-alert criar-vaga-alert-error">
            {error}
          </div>
        )}
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
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !openingId}
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarVaga;