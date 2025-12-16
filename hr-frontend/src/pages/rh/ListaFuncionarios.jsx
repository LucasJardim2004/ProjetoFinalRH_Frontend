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

import "./listaFuncionarios.css";

import { getEmployees } from "../../services/apiClient";

function ListaFuncionarios() {
  const [rowData, setRowData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEmployees() {
      try {
        const employees = await getEmployees();

        const mapped = employees.map((e) => ({
          businessEntityID: e.businessEntityID,
          jobTitle: e.jobTitle,
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

  const defaultColDef = {
    sortable: false,
    filter: true,
    resizable: false,
    flex: 1,
  };

  const [colDefs] = useState([
    {
      field: "businessEntityID",
      headerName: "ID",
      maxWidth: 110,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 1.2,
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
  ]);

  return (
    <div className="vagas-page">
      <div className="vagas-header">
        <div>
          <h1 className="vagas-title">Employees</h1>
          <p className="vagas-subtitle">
            Below you can find a paginated list of employees (20 per page).
          </p>
        </div>
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

export default ListaFuncionarios;