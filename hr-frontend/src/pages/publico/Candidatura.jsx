import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./candidatura.css";

import {
  createCandidateInfo,
  createJobCandidate,
  uploadCandidateCv,
  apiFetch,
  getEmployees
} from "../../services/apiClient";

function Candidatura() {
  const [cvName, setCvName] = useState("No file selected");
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();

  const jobTitleFromState = location.state?.jobTitle || "";
  const openingIDFromState = location.state?.openingID;

  const [birthDateValue, setBirthDateValue] = useState("");
  const [birthDateError, setBirthDateError] = useState("");

  function isAtLeast18YearsOld(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  }

  function handleBirthDateChange(e) {
    const value = e.target.value;
    setBirthDateValue(value);
    if(value && !isAtLeast18YearsOld(value)) {
      setBirthDateError("You must be at least 18 years old to apply.");
    } else {
      setBirthDateError("");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    setCvName(file ? file.name : "No file selected");
  }


async function handleSubmit(e) {
  e.preventDefault();
  setSubmitting(true);

  try {
    if (!openingIDFromState) {
      alert("No opening ID associated with this application. Please start the application from the job openings page.");
      return;
    }

    const formData = new FormData(e.target);
    const jobTitle = jobTitleFromState ?? formData.get("jobTitle") ?? "";
    const firstName = (formData.get("firstName") ?? "").toString().trim();
    const lastName = (formData.get("lastName") ?? "").toString().trim();
    const email = (formData.get("email") ?? "").toString().trim();
    const phoneNumber = (formData.get("telefone") ?? "").toString().trim();
    const birthDateRaw = formData.get("birthdate") ?? "";
    const nationalID = (formData.get("nationalId") ?? "").toString().trim();
    const maritalStatus = (formData.get("maritalStatus") ?? "").toString() ?? "";
    const gender = (formData.get("gender") ?? "").toString() ?? "";
    const comment = (formData.get("comentarios") ?? "").toString().trim();
    const cvFile = formData.get("cv");


    // Check if National ID already exists in Employee table
    try {
        // searchTerm will match NationalIDNumber because controller supports it
        const searchResponse = await getEmployees(1, 100, nationalID);

        const employees = searchResponse?.data ?? [];

        const conflict = employees.find((emp) => {
          const existingNid =
            emp.NationalIDNumber ??
            emp.nationalIDNumber ??
            emp.NationalId ??
            emp.nationalId;

          return (
            existingNid &&
            nationalID &&
            String(existingNid).trim() === String(nationalID).trim()
          );
        });

        if (conflict) {
          alert("This National ID is already registered as an Employee.");
          return;
        }
      } catch (err) {
        console.warn("[handleSubmit] NID check failed:", err);
    }



    // Create JobCandidate
    const jobCandidatePayload = { businessEntityID: null, resume: null };
    const createdJobCandidate = await createJobCandidate(jobCandidatePayload);
    const jobCandidateID = createdJobCandidate?.jobCandidateID;
    if (!jobCandidateID) throw new Error("Could not retrieve JobCandidateID from API response.");

    // Upload CV
    await uploadCandidateCv(jobCandidateID, cvFile);

    // Create CandidateInfo
    const candidateInfoPayload = {
      jobCandidateID,
      openingID: openingIDFromState,
      jobTitle,
      nationalID,
      birthDate: birthDateRaw ? new Date(birthDateRaw.toString()).toISOString() : null,
      maritalStatus,
      gender,
      firstName,
      lastName,
      email,
      phoneNumber,
      comment,
    };
    await createCandidateInfo(candidateInfoPayload);

    alert("Application submitted successfully!");
    e.target.reset();
    setCvName("No file selected");
  } catch (err) {
    console.error("Error submitting application:", err);
    alert(err.message ?? "There was an error submitting your application.");
  } finally {
    setSubmitting(false);
  }
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
          {/* POSITION */}
          <section className="form-section">
            <h2>Position</h2>
            <div className="form-group">
              <label htmlFor="jobTitle">
                Job title <span className="required">*</span>
              </label>
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="e.g. Software Developer"
                defaultValue={jobTitleFromState}
                readOnly={!!jobTitleFromState}
                required
              />
            </div>
          </section>

          {/* PERSONAL DETAILS */}
          <section className="form-section">
            <h2>Personal details</h2>
            <div className="section-grid">
              <div className="form-group">
                <label htmlFor="firstName">
                  First name <span className="required">*</span>
                </label>
                <input id="firstName" name="firstName" type="text" required />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last name <span className="required">*</span>
                </label>
                <input id="lastName" name="lastName" type="text" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
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
                  name="telefone"
                  type="tel"
                  placeholder="e.g. +351 987654321"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthdate">
                  Birth date <span className="required">*</span>
                </label>
                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  required
                  value = {birthDateValue}
                  onChange = {handleBirthDateChange}
                  aria-invalid={!!birthDateError}
                />
                {birthDateError && (<small className="field-error">{birthDateError}</small>)}
              </div>

              <div className="form-group">
                <label htmlFor="nationalId">
                  National ID number{" "}
                  <span className="required">*</span>
                </label>
                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  placeholder="e.g. 12345678"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maritalStatus">
                  Marital status <span className="required">*</span>
                </label>
                <select id="maritalStatus" name="maritalStatus" required>
                  <option value="" disabled>
                    Select an option...
                  </option>
                  <option value="S">Single</option>
                  <option value="M">Married</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select id="gender" name="gender" required>
                  <option value="" disabled>
                    Select an option...
                  </option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </select>
              </div>
            </div>
          </section>

          {/* CV */} 
          <section className="form-section">
            <h2>Curriculum Vitae</h2>
            <div className="form-group">
              <label htmlFor="cv">
                Upload your CV (PDF){" "}
                <span className="required">*</span>
              </label>

              <div className="cv-upload">
                <label htmlFor="cv" className="cv-button">
                  Choose file
                </label>
                <input
                  id="cv"
                  name="cv"
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

          {/* EXTRA INFO */}
          <section className="form-section">
            <h2>Additional information</h2>
            <div className="form-group">
              <label htmlFor="comentarios">
                Tell us briefly what motivates you to apply.
              </label>
              <textarea
                id="comentarios"
                name="comentarios"
                rows={4}
                placeholder="Share your motivation, main interests or availability."
              />
            </div>
          </section>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit application"}
            </button>
            <button
              type="reset"
              className="secondary-button"
              onClick={() => setCvName("No file selected")}
              disabled={submitting}
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