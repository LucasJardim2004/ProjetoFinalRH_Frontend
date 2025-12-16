import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./candidatura.css";

function Candidatura() {
  const [cvName, setCvName] = useState("No file selected");
  const location = useLocation();
  const jobTitleFromState = location.state?.jobTitle || "";

  function handleSubmit(e) {
    e.preventDefault();
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setCvName(file ? file.name : "No file selected");
  }

  return (
    <div className="candidatura-page">
      <div className="candidatura-card">
        <header className="candidatura-header">
          <h1>Job Application</h1>

          {jobTitleFromState && (
            <p className="job-title-highlight">
              Applying for: <strong>{jobTitleFromState}</strong>
            </p>
          )}

          <p>
            Please fill in the form below to submit your application to our
            team. Fields marked with * are required.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="candidatura-form">
          <section className="form-section">
            <h2>Position</h2>
            <div className="form-group">
              <label htmlFor="jobTitle">
                Job title <span className="required">*</span>
              </label>
              <input
                id="jobTitle"
                type="text"
                placeholder="e.g. Software Developer"
                defaultValue={jobTitleFromState}
                readOnly={!!jobTitleFromState}
                required
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Personal details</h2>
            <div className="section-grid">
              <div className="form-group">
                <label htmlFor="nome">
                  Full name <span className="required">*</span>
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="e.g. Your Name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. user@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefone">
                  Phone number <span className="required">*</span>
                </label>
                <input
                  id="telefone"
                  type="tel"
                  placeholder="e.g. +351 987654321"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthdate">
                  Birth date <span className="required">*</span>
                </label>
                <input id="birthdate" type="date" required />
              </div>

              <div className="form-group">
                <label htmlFor="nationalId">
                  National ID number <span className="required">*</span>
                </label>
                <input
                  id="nationalId"
                  type="text"
                  placeholder="e.g. 12345678"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maritalStatus">
                  Marital status <span className="required">*</span>
                </label>
                <select id="maritalStatus" required>
                  <option value="" disabled>
                    Select an option...
                  </option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select id="gender" required>
                  <option value="" disabled>
                    Select an option...
                  </option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Curriculum Vitae</h2>
            <div className="form-group">
              <label htmlFor="cv">
                Upload your CV (PDF) <span className="required">*</span>
              </label>

              <div className="cv-upload">
                <label htmlFor="cv" className="cv-button">
                  Choose file
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <span className="cv-filename">{cvName}</span>
              </div>

              <small className="field-help">
                Max. 10 MB. Accepted formats: PDF.
              </small>
            </div>
          </section>

          <section className="form-section">
            <h2>Additional information</h2>
            <div className="form-group">
              <label htmlFor="comentarios">
                Tell us briefly what motivates you to apply.
              </label>
              <textarea
                id="comentarios"
                rows={4}
                placeholder="Share your motivation, main interests or availability."
              />
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Submit application
            </button>
            <button
              type="reset"
              className="secondary-button"
              onClick={() => setCvName("No file selected")}
            >
              Clear form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Candidatura;