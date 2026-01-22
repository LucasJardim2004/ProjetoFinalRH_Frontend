import { useState, useEffect } from "react";
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

import "./listaFuncionarios.css";

import { getEmployees } from "../../services/apiClient";

import { useAuth } from "../../AuthProvider.jsx";

const ApplyCellRenderer = (props) => {
  const navigate = useNavigate();
  const { data, onDelete } = props;
  const { user, loading } = useAuth();

  const handleDetail = () => {
    navigate(`/funcionario/${data.businessEntityID}`);
  };

  return (
    <div className="vagas-actions-cell">
      {user?.roles?.[0] === "HR" && (
        <button type="button" onClick={handleDetail} className="button-9">
          👁
        </button>
      )}
    </div>
  );
};

function ListaFuncionarios() {
  const [rowData, setRowData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    async function loadEmployees() {
      setLoading(true);
      try {
        const response = await getEmployees(currentPage, pageSize, searchQuery || null);
        const employees = response.data;
        const pagination = response.pagination;

        const mapped = employees.map((e) => ({
          businessEntityID: e.businessEntityID,
          jobTitle: e.jobTitle,
          nationalIDNumber: e.nationalIDNumber ?? "",
          gender: e.gender,
          maritalStatus: e.maritalStatus,
          hireDate: e.hireDate.slice(0, 10),
          birthDate: e.birthDate.slice(0, 10),
        }));

        setRowData(mapped);
        setTotalCount(pagination.totalCount);
        setTotalPages(pagination.totalPages);
      } catch (err) {
        console.error("Error loading employees", err);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [currentPage, pageSize, searchQuery]);

  const defaultColDef = {
    sortable: false,
    filter: true,
    resizable: false,
    flex: 1,
  };

  const [colDefs] = useState([
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 2,
    },
    {
      field: "nationalIDNumber",
      headerName: "National ID",
      flex: 0.8,
      maxWidth: 150,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 0.8,
      maxWidth: 100,
    },
    {
      field: "maritalStatus",
      headerName: "Marital Status",
      maxWidth: 150,
    },
    {
      field: "hireDate",
      headerName: "Hire Date",
      flex: 0.8,
    },
    {
      field: "birthDate",
      headerName: "Birth Date",
      flex: 0.8,
    },
    {
      headerName: "Actions",
      cellRenderer: ApplyCellRenderer,
      flex: 1,
    },
  ]);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Employees List</h1>
        </div>
      </div>

      <div className="search">
        <TextField
          id="employee-search"
          variant="outlined"
          fullWidth
          label="Search Employees"
          placeholder="Type Job Title or National ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading && (
        <p className="no-results" style={{ fontWeight: "bold", color: "#666" }}>Loading employees...</p>
      )}

      {!loading && totalCount === 0 && (
        <p className="no-results" style={{ fontWeight: "bold", color: "red" }}>No employees found.</p>
      )}

      <div className="vagas-card">
        <div className="ag-theme-quartz vagas-grid-wrapper" style={{ display: "flex", flexDirection: "column" }}>
          <AgGridReact
            rowData={rowData}
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
            <span>{(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}</span>
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
              <span style={{ padding: "0px 8px", minWidth: "80px", textAlign: "center" }}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: "4px 8px", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                ▶
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{ padding: "4px 8px", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListaFuncionarios;
