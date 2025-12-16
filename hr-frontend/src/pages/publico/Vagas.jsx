import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import { AgGridReact } from "ag-grid-react";
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
  const [error, setError] = useState(null);
  const [rawOpenings, setRawOpenings] = useState(null);

  useEffect(() => {
    async function loadOpenings() {
      try {
        setError(null);

        const openings = await getOpenings();
        setRawOpenings(openings); // guardar resposta bruta para debug

        const mapped = (openings || []).map((o) => ({
          id:
            o.openingID ??
            o.openingId ??
            o.OpeningID ??
            o.id,
          jobTitle: o.jobTitle ?? o.JobTitle,
          description: o.description ?? o.Description,
          dateCreated: (o.dateCreated ?? o.DateCreated)?.slice(0, 10),
          openFlag: o.openFlag ?? o.OpenFlag,
        }));

        setRowData(mapped);
      } catch (err) {
        setError("Failed to load openings from API: " + err.message);
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
      </div>

      <div className="vagas-card">
        {/* DEBUG VISÍVEL */}
        <div
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            color: "#6b7280",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <strong>Debug:</strong> rowData length = {rowData.length}
          {error && (
            <>
              <br />
              <span style={{ color: "#b91c1c" }}>{error}</span>
            </>
          )}
        </div>

        {/* Se quiseres ver o JSON bruto, descomenta isto */}
        {/* 
        <pre
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.7rem",
            maxHeight: 200,
            overflow: "auto",
            borderBottom: "1px solid #e5e7eb",
            margin: 0,
          }}
        >
          {JSON.stringify(rawOpenings, null, 2)}
        </pre>
        */}

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