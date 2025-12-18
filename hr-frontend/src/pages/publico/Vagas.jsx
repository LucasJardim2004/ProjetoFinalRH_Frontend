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

import { getOpenings, deleteOpening } from "../../services/apiClient";

import { useAuth } from "../../AuthProvider.jsx"

const ApplyCellRenderer = (props) => {
  const navigate = useNavigate();
  const { data, onDelete } = props;
  const { user, loading } = useAuth();

  const handleApply = () => {
    navigate("/candidatura", { state: { jobTitle: data.jobTitle } });
  };

  const handleEdit = () => {
    navigate("/rh/editarVaga", {
      state: {
        openingId: data.openingID,
        jobTitle: data.jobTitle,
        description: data.description,
      },
    });
  };

  const handleDeleteClick = () => {
    if (!data.openingID) {
      console.error("No openingID on row:", data);
      alert("Could not detect opening ID for this row.");
      return;
    }
    onDelete(data.openingID);
  };

  return (
    <div className="vagas-actions-cell">
      {user?.roles?.[0] === "HR" && (
      <button
        type="button"
        className="vagas-icon-btn"
        title="Edit opening"
        onClick={handleEdit}
        className="vagas-icon-btn"
      >
        ✏️
      </button>
      )}
      {user?.roles?.[0] === "HR" && (
      <button
        type="button"
        className="vagas-icon-btn vagas-icon-btn-danger"
        title="Delete opening"
        onClick={handleDeleteClick}
        className="vagas-icon-btn vagas-icon-btn-danger"
      >
        🗑️
      </button>
      )}
      
      <button type="button" onClick={handleApply} className="button-9">
        Apply
      </button>
    </div>
  );
};

function Vagas() {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  console.log(user);

  function handleGoToCreateOpening() {
    navigate("/rh/criarVaga");
  }

  async function handleDeleteOpening(openingID) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this opening?"
    );
    if (!confirmDelete) return;

    try {
      await deleteOpening(openingID);

      setRowData((prev) =>
        prev.filter((row) => row.openingID !== openingID)
      );

      alert("Opening deleted successfully.");
    } catch (err) {
      console.error("Error deleting opening:", err);
      alert("Error deleting opening. Check console for details.");
    }
  }

  useEffect(() => {
    async function loadOpenings() {
      try {
        const openings = await getOpenings();
        const mapped = openings.map((o) => ({
          openingID: o.openingID,
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
      cellRendererParams: {
        onDelete: handleDeleteOpening,
      },
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

        {user?.roles?.[0] === "HR" && (
        <button
          type="button"
          onClick={handleGoToCreateOpening}
          className="vagas-create-btn"
        >
          + Create opening
        </button>
        )}
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