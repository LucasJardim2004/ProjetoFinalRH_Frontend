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

  const handleApply = () => {
    navigate("/candidatura", { state: { jobTitle: data.jobTitle } });
  };

  const handleEdit = () => {
    // Mais tarde podes navegar para uma página de edição: /rh/editar-vaga/:id
    alert(`Edit opening: ${data.jobTitle}`);
  };

  const handleDelete = () => {
    await deleteOpening(data.id);
  };

  return (
    <div className="vagas-actions-cell">
      <button
        type="button"
        className="vagas-icon-btn"
        title="Edit opening"
        onClick={handleEdit}
      >
        ✏️
      </button>
      <button
        type="button"
        className="vagas-icon-btn vagas-icon-btn-danger"
        title="Delete opening"
        onClick={handleDelete}
      >
        🗑️
      </button>
      <button type="button" onClick={handleApply} className="button-9">
        Apply
      </button>
    </div>
  );
};

function Vagas() {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();

  function handleGoToCreateOpening() {
    navigate("/rh/criarVaga");
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
      flex: 1.5,
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
          className="vagas-create-btn"
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