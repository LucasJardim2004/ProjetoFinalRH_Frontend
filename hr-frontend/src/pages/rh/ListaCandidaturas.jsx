import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// AG Grid core + módulos
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

// AG Grid React wrapper
import { AgGridReact } from "ag-grid-react";

// AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./ListaCandidaturas.css";

import {
  getCandidateInfosByOpening,
  getCandidateCvUrl,
} from "../../services/apiClient";
/*adicionei*/
function DetalhesButtonRenderer(props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/rh/candidaturas/${props.data.jobCandidateID}`, {
      state: {
        candidate: props.data,
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "4px 10px",
        fontSize: "0.85rem",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#2563eb",
        color: "#fff",
      }}
    >
      Detalhes
    </button>
  );
}

const CvButtonRenderer = (props) => {
  const fileName = props.data?.resumeFile;

  if (!fileName) {
    return (
      <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
        No CV
      </span>
    );
  }

  const url = getCandidateCvUrl(fileName);

  const handleClick = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      className="vagas-icon-btn"
      onClick={handleClick}
    >
      📄
    </button>
  );
};

function ListaCandidaturas() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const openingID = location.state?.openingID;
  const jobTitle = location.state?.jobTitle;

  useEffect(() => {
    async function loadCandidates() {
      if (!openingID) {
        console.warn("No openingID provided to ListaCandidaturas page.");
        setLoading(false);
        return;
      }

      try {
        console.log("ASDFGH");
        const candidates = await getCandidateInfosByOpening(openingID);
        console.log("Candidates" + candidates);

        const mapped = (candidates || []).map((c) => ({
          id: c.id ?? c.ID,
          jobCandidateID: c.jobCandidateID ?? c.JobCandidateID,
          fullName: [c.firstName, c.middleName, c.lastName]
            .filter(Boolean)
            .join(" "),
          email: c.email,
          phoneNumber: c.phoneNumber,
          gender: c.gender,
          maritalStatus: c.maritalStatus,
          birthDate: c.birthDate ? c.birthDate.slice(0, 10) : "",
          nationalID: c.nationalID,
          comment: c.comment,
          resumeFile:
            c.jobCandidate?.resumeFile ??
            c.JobCandidate?.ResumeFile ??
            null,
        }));

        setRowData(mapped);
      } catch (err) {
        console.error("Error loading candidates for opening", err);
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, [openingID]);

  const defaultColDef = {
    sortable: false,
    filter: true,
    resizable: false,
    flex: 1,
  };

  const [colDefs] = useState([
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.4,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.6,
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      maxWidth: 160,
    },
    {
      field: "nationalID",
      headerName: "National ID",
      maxWidth: 150,
    },
    {
      field: "birthDate",
      headerName: "Birth Date",
      maxWidth: 140,
    },
    /*adicionei*/ 
    {
      headerName: "Actions",
      width: 140,              // IMPORTANT (see point 2)
      cellRenderer: DetalhesButtonRenderer,
      sortable: false,
      filter: false,
      flex: 0.6
    }
    {
      headerName: "CV",
      field: "resumeFile",
      maxWidth: 140,
      cellRenderer: CvButtonRenderer,
    },
  ]);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Applications</h1>
          {jobTitle ? (
            <p className="vagas-subtitle">
              Candidates who applied for: <strong>{jobTitle}</strong>
            </p>
          ) : (
            <p className="vagas-subtitle">
              Candidates associated with the selected opening.
            </p>
          )}

          {!loading && rowData.length === 0 && (
            <p className="vagas-subtitle" style={{ marginTop: "0.25rem" }}>
              No applications found for this opening.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="vagas-create-btn"
        >
          ← Back to openings
        </button>
      </div>

      <div className="vagas-card">
        <div className="ag-theme-quartz vagas-grid-wrapper">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowHeight={40}
            headerHeight={40}
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      </div>
    </div>
  );
}

export default ListaCandidaturas;