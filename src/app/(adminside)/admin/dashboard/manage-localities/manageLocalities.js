"use client";
import { useState } from "react";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import GenerateForm from "../common-model/generateForm";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";

export default function ManageLocality({ cityList, localityList, typeList }) {
    const inputFields = [
        {
            id: "localityName",
            label: "Locality Name",
            type: "text",
        },
        {
            id: "cityId",
            label: "City",
            type: "select",
            list: cityList,
            from: "localities"
        },
        {
            id: "averagePricePerSqFt",
            label: "Average Price / sqft",
            type: "number",
        },
        {
            id: "description",
            label: "Locality Description",
            type: "textarea",
        },
        {
            id: "localityCategory",
            label: "Locality Category",
            type: "select",
            list: typeList.map((item, index)=> ({
                ...item,
                stateName: item.projectTypeName
            }))
        },
    ];
    const getInitialFormData = () =>
        Object.fromEntries(inputFields.map(item => [item.id, ""]));
    const [validated, setValidated] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [buttonName, setButtonName] = useState(null);
    const [formData, setFormData] = useState(getInitialFormData);
    const [title, setTitle] = useState(null);
    const [cityId, setCityId] = useState(0);
    const [localityId, setLocalityId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);
    //Handeling opening of add model
    const openAddModel = () => {
        setFormData(getInitialFormData);
        setValidated(false);
        setCityId(0);
        setTitle("Add New Locality");
        setButtonName("Add Locality");
        setShowModel(true);
    };

    //Handeling opening of add model
    const openEditPopUp = (data) => {
        setFormData(data);
        setValidated(false);
        setCityId(data.cityId);
        setTitle("Update Locality");
        setButtonName("Update Locality");
        setShowModel(true);
    };

    //Handle deletion of locality
    const openConfirmationDialog = (id) => {
        setLocalityId(id);
        setConfirmBox(true);
    }

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "localityName", headerName: "Locality Name", flex: 1, cellClassName: "text-capitalize" },
        { field: "cityName", headerName: "City Name", flex: 1 },
        { field: "stateName", headerName: "State Name", flex: 1 },
        { field: "description", headerName: "Locality Description", flex: 1, cellClassName: "text-capitalize" },
        { field: "localityCategoryName", headerName: "Locality Category", flex: 1, cellClassName: "text-capitalize" },
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
        <>
            {/* header section  */}
            <DashboardHeader
                buttonName={"Add New Locality"}
                functionName={openAddModel}
                heading={"Manage Localities"}
            />

            {/* table section  */}
            <div>
                <DataTable columns={columns} list={localityList} />
            </div>

            {/* form section  */}
            <GenerateForm
                api={"locality/add-update"}
                buttonName={buttonName}
                formData={formData}
                inputFields={inputFields}
                setButtonName={setButtonName}
                setFormData={setFormData}
                setShowLoading={setShowLoading}
                setShowModal={setShowModel}
                setValidated={setValidated}
                showLoading={showLoading}
                showModal={showModel}
                title={title}
                validated={validated}
            />

            <CommonModal 
                api={`${process.env.NEXT_PUBLIC_API_URL}locality/delete/${localityId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </>
    )
}