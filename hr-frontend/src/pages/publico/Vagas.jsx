import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// AG Grid core + módulos
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

// AG Grid React wrapper
import { AgGridReact } from "ag-grid-react";

// AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./vagas.css";

import { getOpenings } from "../../services/apiClient";

const ApplyCellRenderer = (props) => {
  const navigate = useNavigate();
  const { data } = props;

  const handleClick = () => {
    navigate("/candidatura", { state: { jobTitle: data.jobTitle } });
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button type="button" onClick={handleClick} className="button-9">
        Apply
      </button>
    </div>
  );
};

function Vagas() {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();

  function handleGoToCreateOpening() {
    navigate("/rh/criar-vaga");
  }

  useEffect(() => {
    async function loadOpenings() {
      try {
        const openings = await getOpenings();
        const mapped = openings.map((o) => ({
          id: o.openingID ?? o.openingId ?? o.id,
          jobTitle: o.jobTitle,
          description: o.description,
          dateCreated: o.dateCreated?.slice(0, 10),
          openFlag: o.openFlag,
        }));
        setRowData(mapped);
      } catch (err) {
        console.error("Error loading openings", err);
      }
    }
    loadOpenings();
  }, []);

  const defaultColDef = {
    sortable: false,
    filter: true,
    resizable: false,
    flex: 1,
  };

  const [colDefs] = useState([
    { field: "jobTitle", headerName: "Job Title", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "dateCreated", headerName: "Date Created" },
    {
      headerName: "Actions",
      cellRenderer: ApplyCellRenderer,
      flex: 0.7,
    },
  ]);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Open Positions</h1>
          <p className="vagas-subtitle">
            Below you can find all job postings currently registered in the
            system.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToCreateOpening}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(135deg, #4949FF 0%, #0000FF 100%)",
            color: "#ffffff",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 18px rgba(0, 0, 255, 0.28)",
            whiteSpace: "nowrap",
          }}
        >
          + Create opening
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
          />
        </div>
      </div>
    </div>
  );
}

export default Vagas;