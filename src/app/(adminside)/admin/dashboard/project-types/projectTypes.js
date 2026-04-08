"use client";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useState } from "react";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import GenerateForm from "../common-model/generateForm";

export default function ProjectTypes({ list }) {
    //defining input fields
    const inputFields = [
        {
            id: "projectTypeName",
            label: "Project Type",
            type: "text"
        },
        {
            id: "metaTitle",
            label: "Meta Title",
            type: "text"
        },
        {
            id: "projectTypeDesc",
            label: "Project Type Description",
            type: "textarea"
        },
        {
            id: "metaKeyword",
            label: "Meta Keywords",
            type: "textarea"
        },
        {
            id: "metaDesc",
            label: "Meta Description",
            type: "textarea"
        },
    ];
    //defining initial form fields value
    const getInitialFormData = () =>
        Object.fromEntries(inputFields.map(item => [item.id, ""]));

    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [buttonName, setButtonName] = useState("");
    const [validated, setValidated] = useState(false);
    const [id, setId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData);

    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setId(id);
    };
    //Handling opening of edit model
    const openEditPopUp = (data) => {
        setFormData({
            ...data,
            id: data.id || 0
        });
        setTitle("Edit Project Type");
        setButtonName("Update Project Type");
        setShowModal(true);
    };
    //Handling opening of add model
    const openAddModel = () => {
        setId(0);
        setTitle("Add Project Type");
        setButtonName("Add Type");
        setValidated(false);
        setShowModal(true);
        setFormData(getInitialFormData);
    };

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "projectTypeName", headerName: "Project Type Name", flex: 1 },
        { field: "metaTitle", headerName: "Meta Title", flex: 1 },
        { field: "metaDesc", headerName: "Meta Description", flex: 1 },
        { field: "metaKeyword", headerName: "Meta Keyword", flex: 1 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="d-flex align-items-center gap-2">
                    <span
                        className="d-inline-flex"
                        style={{ cursor: "pointer" }}
                        onClick={() => openConfirmationBox(params.row.id)}
                        role="presentation"
                    >
                        <AdminTableDeleteIcon />
                    </span>
                    <span
                        className="d-inline-flex"
                        style={{ cursor: "pointer" }}
                        onClick={() => openEditPopUp(params.row)}
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
                heading={"Manage Project Types"}
                buttonName={"+ Add Project Type"}
                functionName={openAddModel}
            />
            <div className="table-container">
                <DataTable columns={columns} list={list} />
            </div>
            {/* Modal for adding a new city */}
            <GenerateForm
                api={'project-types/add-update'}
                buttonName={buttonName}
                formData={formData}
                inputFields={inputFields}
                setButtonName={setButtonName}
                setShowLoading={setShowLoading}
                setShowModal={setShowModal}
                setValidated={setValidated}
                showLoading={showLoading}
                showModal={showModal}
                title={title}
                validated={validated}
                setFormData={setFormData}

            />
            <CommonModal
                api={`${process.env.NEXT_PUBLIC_API_URL}project-types/delete/${id}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </div>
    );
}
