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
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEmployees() {
      try {
        const employees = await getEmployees();

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
      } catch (err) {
        console.error("Error loading employees", err);
      }
    }

    loadEmployees();
  }, []);

  const filteredRowData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rowData;

    return rowData.filter((row) => {
      const nid = (row.nationalIDNumber ?? "").toString().toLowerCase();
      const jobTitle = (row.jobTitle ?? "").toString().toLowerCase();
      return nid.includes(q) || jobTitle.includes(q);
    });
  }, [rowData, searchQuery]);

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
      flex: 1.2,
    },
    {
      field: "nationalIDNumber",
      headerName: "National ID",
      flex: 1,
      maxWidth: 150,
    },
    {
      field: "gender",
      headerName: "Gender",
      maxWidth: 120,
    },
    {
      field: "maritalStatus",
      headerName: "Marital Status",
      maxWidth: 150,
    },
    {
      field: "hireDate",
      headerName: "Hire Date",
    },
    {
      field: "birthDate",
      headerName: "Birth Date",
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
      {filteredRowData.length === 0 && (
        <p className="no-results" style={{ fontWeight: "bold", color: "red" }}>No employees found.</p>
      )}

      <div className="vagas-card">
        <div className="ag-theme-quartz vagas-grid-wrapper">
          <AgGridReact
            rowData={filteredRowData}
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

export default ListaFuncionarios;
