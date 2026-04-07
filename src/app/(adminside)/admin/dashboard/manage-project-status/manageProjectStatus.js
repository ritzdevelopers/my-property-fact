"use client";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { AdminTableEditIcon } from "../common-model/admin-table-icons";
import { useState } from "react";
import GenerateForm from "../common-model/generateForm";

export default function ManageProjectStatus({ projectStatusList = [] }) {
  //Defining from fields for project status
  const inputFields = [
    {
      id: "statusName",
      label: "Status name",
      type: "text",
    },
    {
      id: "description",
      label: "Description",
      type: "textarea",
    },
  ];

  const getInitialFormData = () =>
    Object.fromEntries(inputFields.map((item) => [item.id, ""]));
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);
  const [buttonName, setButtonName] = useState("Add New Status");
  const [title, setTitle] = useState("Add New Project Status");
  const [validated, setValidated] = useState(false);

  //Project Status Add Handler
  const addProjectStatus = () => {
    setShowModal(true);
    setFormData(getInitialFormData);
  };

  //Project Status Edit Handler
  const openEditModel = (data) => {
    setShowModal(true);
    setFormData(data);
    setTitle("Update New Project Status");
    setButtonName("Update Status");
  };

  //defining colums for project status table
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    { field: "statusName", headerName: "Status Name", flex: 1 },
    { field: "code", headerName: "Status Code", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="gap-3">
          <span
            className="d-inline-flex mx-2"
            style={{ cursor: "pointer" }}
            onClick={() => openEditModel(params.row)}
            role="presentation"
          >
            <AdminTableEditIcon />
          </span>
        </div>
      ),
    },
  ];
  return (
    <div>
      <DashboardHeader
        buttonName={"Add New Status"}
        functionName={addProjectStatus}
        heading={"Manage Project Status"}
      />
      <div>
        <DataTable columns={columns} list={projectStatusList} />
      </div>

      {/* form section  */}
      <GenerateForm
        api={"project-status"}
        buttonName={buttonName}
        formData={formData}
        inputFields={inputFields}
        setButtonName={setButtonName}
        setFormData={setFormData}
        setShowLoading={setLoading}
        setShowModal={setShowModal}
        setValidated={setValidated}
        showLoading={loading}
        showModal={showModal}
        title={title}
        validated={validated}
      />
    </div>
  );
}
