"use client";
import { useState } from "react";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import CommonModal from "../common-model/common-model";
import GenerateForm from "../common-model/generateForm";
export default function City({ list, stateList }) {
    const inputFields = [
        {
            id: "cityName",
            label: "City Name",
            type: "text",
        },
        {
            id: "stateId",
            label: "State Name",
            type: "select",
            list: stateList
        },
        {
            id: "metaTitle",
            label: "Meta Title",
            type: "text",
        },
        {
            id: "metaKeywords",
            label: "Meta Keywords",
            type: "text",
        },
        {
            id: "metaDescription",
            label: "Meta Description",
            type: "textarea",
        },
        {
            id: "cityDescription",
            label: "City Description",
            type: "textarea",
        },
    ];
    const getInitialFormData = () =>
        Object.fromEntries(inputFields.map(item => [item.id, ""]));
    const [showModal, setShowModal] = useState(false);
    const [buttonName, setButtonName] = useState("");
    const [validated, setValidated] = useState(false);
    const [confirmBox, setConfirmBox] = useState(false);
    const [cityId, setCityId] = useState(0);
    const [showLoading, setShowLoading] = useState(false);
    const [title, setTitle] = useState(null);

    const [formData, setFormData] = useState(getInitialFormData);

    //Handeling opening of edit model
    const openEditPopUp = (data) => {
        setTitle("Edit City");
        setButtonName("Update City");
        setShowModal(true);        
        setFormData({
            id: data.id || 0,
            ...data
        });
    };

    //Handeling opening of add model
    const openAddModel = () => {
        setFormData(getInitialFormData);
        setValidated(false);
        setCityId(0);
        setTitle("Add New City");
        setButtonName("Add City");
        setShowModal(true);
    };

    const openConfirmationDialog = (id) => {
        setConfirmBox(true);
        setCityId(id);
    };

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "cityName", headerName: "City Name", flex: 1 },
        { field: "stateName", headerName: "State", flex: 1 },
        { field: "cityDescription", headerName: "City Description", flex: 1},
        { field: "countryName", headerName: "Country", flex: 1 },
        {
            field: "metaTitle",
            headerName: "Meta Title",
            flex: 1
        },
        {
            field: "metaKeywords",
            headerName: "Meta Keyword",
            flex: 1
        },
        {
            field: "metaDescription",
            headerName: "Meta Description",
            flex: 1
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
                        onClick={() => openConfirmationDialog(params.row.id)}
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
            <DashboardHeader heading={"Manage Cities"} buttonName={"+ Add new city"} functionName={openAddModel} />
            <div className="table-container">
                <DataTable list={list} columns={columns} />
            </div>
            {/* Modal for adding a new city */}
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
                api={"city/add-new"}
            />
            <CommonModal
                api={`${process.env.NEXT_PUBLIC_API_URL}city/delete/${cityId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </div>
    );
}
