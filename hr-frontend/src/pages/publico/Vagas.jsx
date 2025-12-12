import { useState } from "react";
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
      <button
        type="button"
        onClick={handleClick}
        className="button-9"
      >
        Apply
      </button>
    </div>
  );
};

function Vagas() {
  // Row Data: The data to be displayed.
  const [rowData] = useState([
    {
      jobTitle: "SCRUM Master",
      description: "Agile team facilitator",
      dateCreated: "2025-01-10",
    },
    {
      jobTitle: "Software Developer",
      description: "Software development specialist",
      dateCreated: "2025-01-20",
    },
    {
      jobTitle: "Business Analyst",
      description: "Business process expert",
      dateCreated: "2025-07-05",
    },
    {
      jobTitle: "HR Manager",
      description: "Human resources leader",
      dateCreated: "2025-10-25",
    },
  ]);

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
