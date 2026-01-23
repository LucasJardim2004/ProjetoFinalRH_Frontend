import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// AG Grid core + módulos
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import { TextField } from "@mui/material";

// AG Grid React wrapper
import { AgGridReact } from "ag-grid-react";

// AG Grid styles
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import "./vagas.css";

import { getOpenings, deleteOpening } from "../../services/apiClient";

import { useAuth } from "../../AuthProvider.jsx";

const ApplyCellRenderer = (props) => {
  const navigate = useNavigate();
  const { data, onDelete } = props;

  const { user, loading } = useAuth();

  const handleApply = () => {
    navigate("/candidatura", {
      state: {
        jobTitle: data.jobTitle,
        openingID: data.openingID,
      },
    });
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
    console.log("Deleting opening with ID:", data.openingID);
    onDelete(data.openingID);
  };

  const handleSeeCandidates = () => {
    if (!data.openingID) {
      console.error("No openingID on row:", data);
      alert("Could not detect opening ID for this row.");
      return;
    }

    navigate("/rh/listaCandidaturas", {
      state: {
        openingID: data.openingID,
        jobTitle: data.jobTitle,
      },
    });
  };

  return (
    <div className="vagas-actions-cell">
      {user?.roles?.[0] === "HR" && (
        <button
          type="button"
          className="vagas-icon-btn"
          title="Edit opening"
          onClick={handleEdit}
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
        >
          🗑️
        </button>
      )}
      {user?.roles?.[0] === "HR" && (
        <button
          type="button"
          onClick={handleSeeCandidates}
          className="button-9 vagas-see-candidates-btn"
        >
          See candidates
        </button>
      )}
      {user?.roles?.[0] != "HR" && (
        <button type="button" onClick={handleApply} className="button-9">
          Apply
        </button>
      )}
    </div>
  );
};

function Vagas() {
  const [rowData, setRowData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

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

      setRowData((prev) => prev.filter((row) => row.openingID !== openingID));

      alert("Opening deleted successfully.");
    } catch (err) {
      console.error("Error deleting opening:", err);
      const responseData = err?.response?.data ?? err?.data;
      const apiMessage =
        responseData?.message ??
        (typeof responseData === "string" ? responseData : null) ??
        err?.message ??
        null;

      console.error("API error data:", responseData);
      console.error("Full message:", apiMessage);
      alert(apiMessage || "Error deleting opening. Please try again later.");
    }
  }

  useEffect(() => {
    async function loadOpenings() {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }

    loadOpenings();
  }, []);

  const allFilteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rowData;

    return rowData.filter((row) => {
      const jobTitle = (row.jobTitle ?? "").toString().toLowerCase();
      return jobTitle.includes(q);
    });
  }, [rowData, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredRowData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return allFilteredData.slice(startIdx, endIdx);
  }, [allFilteredData, currentPage, pageSize]);

  const defaultColDef = {
    sortable: false,
    filter: true,
    resizable: false,
    flex: 1,
  };

  const [colDefs] = useState([
    { field: "jobTitle", headerName: "Job Title", flex: 2 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "dateCreated", headerName: "Date Created" },
    {
      headerName: "Actions",
      cellRenderer: ApplyCellRenderer,
      cellRendererParams: {
        onDelete: handleDeleteOpening,
      },
      flex: 2,
    },
  ]);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Job Openings</h1>
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

      <div className="search">
        <TextField
          id="opening-search"
          variant="outlined"
          fullWidth
          label="Search Openings"
          placeholder="Type Job Title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="vagas-card">
        <div className="ag-theme-quartz vagas-grid-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "500px" }}>
          {!loading && filteredRowData.length === 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <p className="no-results" style={{ fontWeight: "bold", color: "red" }}>No openings found.</p>
            </div>
          )}

          {filteredRowData.length > 0 && (
            <>
              <AgGridReact
                rowData={filteredRowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowHeight={40}
                headerHeight={40}
                pagination={false}
                style={{ flex: 1 }}
              />
              <div style={{ 
                padding: "10px 12px", 
                backgroundColor: "#f5f5f5", 
                borderTop: "1px solid #ddd",
                fontSize: "13px",
                color: "#666",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px"
              }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="pageSize">Page Size:</label>
              <select 
                id="pageSize"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ padding: "4px 8px", cursor: "pointer" }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span>{(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, allFilteredData.length)} of {allFilteredData.length}</span>
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{ padding: "4px 8px", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ⏮
              </button>
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{ padding: "4px 8px", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                ◀
              </button>
              <span style={{ padding: "0px 8px", minWidth: "80px", textAlign: "center" }}>Page {currentPage} of {Math.ceil(allFilteredData.length / pageSize) || 1}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(Math.ceil(allFilteredData.length / pageSize), currentPage + 1))}
                disabled={currentPage === Math.ceil(allFilteredData.length / pageSize)}
                style={{ padding: "4px 8px", cursor: currentPage === Math.ceil(allFilteredData.length / pageSize) ? "default" : "pointer", opacity: currentPage === Math.ceil(allFilteredData.length / pageSize) ? 0.5 : 1 }}
              >
                ▶
              </button>
              <button 
                onClick={() => setCurrentPage(Math.ceil(allFilteredData.length / pageSize))}
                disabled={currentPage === Math.ceil(allFilteredData.length / pageSize)}
                style={{ padding: "4px 8px", cursor: currentPage === Math.ceil(allFilteredData.length / pageSize) ? "default" : "pointer", opacity: currentPage === Math.ceil(allFilteredData.length / pageSize) ? 0.5 : 1 }}
              >
                ⏭
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vagas;
