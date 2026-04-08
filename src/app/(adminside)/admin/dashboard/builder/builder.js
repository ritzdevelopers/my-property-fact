"use client";
import { useState } from "react";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import GenerateForm from "../common-model/generateForm";
import DashboardHeader from "../common-model/dashboardHeader";
export default function Builder({ list }) {
    //Defining from fields for builder
    const inputFields = [
        {
            id: "builderName",
            label: "Builder name",
            type: "text"
        },
        {
            id: "builderDesc",
            label: "Builder description",
            type: "textarea"
        },
        {
            id: "metaTitle",
            label: "Meta title",
            type: "text"
        },
        {
            id: "metaKeyword",
            label: "Meta keyword",
            type: "textarea"
        },
        {
            id: "metaDesc",
            label: "Meta description",
            type: "textarea"
        },
    ];

    const getInitialFormData = () =>
        Object.fromEntries(inputFields.map(item => [item.id, '']));
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [buttonName, setButtonName] = useState("");
    const [validated, setValidated] = useState(false);
    const [id, setId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData);

    //Handling opening of edit builer form
    const openEditPopUp = (data) => {
        setFormData({
            ...data,
            id: data.id
        });
        setTitle("Edit Builder");
        setButtonName("Update Builder");
        setShowModal(true);
    };

    //Handling opening of new add builder form
    const openAddModel = () => {
        setValidated(false);
        setFormData(getInitialFormData);
        setTitle("Add Builder");
        setButtonName("Add Builder");
        setShowModal(true);
    };

    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setId(id);
    };

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "builderName", headerName: "Builder Name", flex: 1 },
        { field: "metaTitle", headerName: "Meta title", flex: 1 },
        {
            field: "metaKeyword",
            headerName: "Meta Keyword",
            flex: 1,
        },
        {
            field: "metaDesc",
            headerName: "Meta Description",
            flex: 1,
        },
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
            <DashboardHeader buttonName={"+ Add Builder"} functionName={openAddModel} heading={"Manage Builders"} />
            <div className="table-container">
                <DataTable columns={columns} list={list} />
            </div>
            <GenerateForm
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
                api={"builder/add-update"}
            />
            <CommonModal
                api={`${process.env.NEXT_PUBLIC_API_URL}builder/delete/${id}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </div>
    );
}
