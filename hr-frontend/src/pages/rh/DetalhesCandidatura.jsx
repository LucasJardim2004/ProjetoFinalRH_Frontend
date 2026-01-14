import { useParams, useLocation, useNavigate } from "react-router-dom";
import { deleteJobCandidate, deleteCandidateInfo,createEmployee,registerEmployee,updateUserRoles } from "../../services/apiClient"; // adjust path

function DetalhesCandidatura() {
  const { jobCandidateID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const candidate = location.state?.candidate;
    const [firstName, ...lastNameParts] = candidate.fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ");


  const handleAccept = async () => {
    try {
      if (!candidate) {
        console.error("Candidate not found in navigation state");
        return;
      }

      const [firstName, ...lastNameParts] = String(candidate.fullName || "").trim().split(" ");
      const lastName = lastNameParts.join(" ");

      // 1) Create Employee
      const employeeDto = {
        PersonType: "EM",
        FirstName: firstName,
        LastName: lastName,
        EmailAddress: candidate.email,
        PhoneNumber: candidate.phoneNumber,
        DepartmentId: 1, // adjust if needed
        EmployeeDTO: {
          JobTitle: "New Hire",
          NationalIDNumber: candidate.nationalID,
          BirthDate: candidate.birthDate,
          Gender: candidate.gender,
          MaritalStatus: candidate.maritalStatus,
          HireDate: new Date().toISOString().split("T")[0],
        },
      };
      const employee = await createEmployee(employeeDto);
      
      const beid = employee?.BusinessEntityID ?? employee?.businessEntityID;

      console.log("[accept] employee created BEID =", beid);

      // 2) Register User (Register already gives "Employee" role)
      const registerDto = {
        UserName: candidate.email.split("@")[0],
        Email: candidate.email,
        FullName: candidate.fullName,
        BusinessEntityID: beid,
        Password: "Portugal2025!", // TODO: generate or let user set
      };
      const registerResult = await registerEmployee(registerDto);
      console.log("[accept] register result", registerResult);

      // 3) Delete Candidate records
      await deleteCandidateInfo(candidate.id);
      await deleteJobCandidate(jobCandidateID);
      

      // 4) Redirect
      navigate("/Vagas");
    } catch (err) {
      console.error("Error accepting candidate:", err);
    }
  };

 
  const handleRefuse = async () => {
    try {
      await deleteJobCandidate(jobCandidateID);
      console.log("Candidate deleted from JobCandidates:", jobCandidateID);
    } catch (err) {
      console.error("Error deleting from JobCandidates:", err);
    }

    try {
      await deleteCandidateInfo(candidate.id); // CandidateInfo ID
      console.log("Candidate deleted from CandidateInfos:", candidate.id);
    } catch (err) {
      console.error("Error deleting from CandidateInfos:", err);
    }

    // Redirect back to ListaCandidaturas
    navigate("/Vagas");
  };

  if (!candidate) {
    return <p>No candidate details found.</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Candidate Details</h1>

      <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" }}>
        <h2>{candidate.fullName}</h2>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phoneNumber}</p>
        <p><strong>Gender:</strong> {candidate.gender === "M" ? "Male" : "Female"}</p>
        <p><strong>Marital Status:</strong> {candidate.maritalStatus === "S" ? "Single" : "Married"}</p>
        <p><strong>Birth Date:</strong> {new Date(candidate.birthDate).toLocaleDateString()}</p>
        <p><strong>National ID:</strong> {candidate.nationalID}</p>
        <p><strong>Comment:</strong> {candidate.comment}</p>
      </div>

      {/* Action buttons */} 
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
        <button
          onClick={handleAccept}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          ✅ Accept
        </button>
        <button
          onClick={handleRefuse}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          ❌ Refuse
        </button>
      </div>
    </div>
  );
}

export default DetalhesCandidatura;
