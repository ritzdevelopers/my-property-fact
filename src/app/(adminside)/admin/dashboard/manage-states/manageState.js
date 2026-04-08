"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useState } from "react";
import GenerateForm from "../common-model/generateForm";
import CommonModal from "../common-model/common-model";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";

export default function ManageState({ countryList, stateList }) {
    const [showCityList, setSetShowCityList] = useState(false);
    const [cityList, setCityList] = useState([]);
    const inputFields = [
        {
            id: "stateName",
            label: "State Name",
            type: "text"
        },
        {
            id: "countryId",
            label: "Country",
            type: "select",
            list: countryList
        },
        {
            id: "stateDescription",
            label: "Description",
            type: "textarea"
        },
    ];
    const getInitialFormData = () =>
        Object.fromEntries(inputFields.map(item => [item.id, ""]));
    const [showModal, setShowModal] = useState(false);
    const [buttonName, setButtonName] = useState("");
    const [validated, setValidated] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [formData, setFormData] = useState(getInitialFormData);
    const [stateId, setStateId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);
    const router = useRouter();

    //Handeling opening of edit model
    const openEditPopUp = (data) => {
        setTitle("Edit State");
        setButtonName("Update State");
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
        setStateId(0);
        setTitle("Add New State");
        setButtonName("Add State");
        setShowModal(true);
    };

    //handling delete operation
    const openConfirmation = (id) => {
        setConfirmBox(true);
        setStateId(id);
    }

    //Defining columns for the table
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "stateName", headerName: "State Name", flex: 1 },
        { field: "stateDescription", headerName: "State Description", flex: 2 },
        { field: "countryName", headerName: "State Name", flex: 1 },
        {
            field: "noOfCities", headerName: "Total Cities", flex: 1,
            renderCell: (params) => (
                <div className="d-flex align-items-center">
                    <span className="p-0 fs-5">{params.row.cityList.length}</span>
                    <FontAwesomeIcon
                        className="text-warning mx-4 fs-5"
                        style={{ cursor: "pointer" }}
                        icon={faEye}
                        onClick={() => openCityList(params.row)}
                        title="View States list"
                    />
                </div>
            )
        },
        {
            field: "action", headerName: "Action", width: 100,
            renderCell: (params) => (
                <div className="d-flex align-items-center justify-content-center mt-3 gap-3">
                    <span
                        className="d-inline-flex"
                        style={{ cursor: "pointer" }}
                        onClick={() => openEditPopUp(params.row)}
                        role="presentation"
                    >
                        <AdminTableEditIcon />
                    </span>
                    <span
                        className="d-inline-flex"
                        style={{ cursor: "pointer" }}
                        onClick={() => openConfirmation(params.row.id)}
                        role="presentation"
                    >
                        <AdminTableDeleteIcon />
                    </span>
                </div>
            )
        },
    ];

    const openCityList = (row) => {
        if (row.cityList.length > 0) {
            setSetShowCityList(true);
        }
        setCityList(row.cityList);
    }
    return (
        <>
            <DashboardHeader
                buttonName={"Add State"}
                heading={"Manage States"}
                functionName={openAddModel}
            />
            <div>
                <DataTable columns={columns} list={stateList} />
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
                api={"state/add-update"}
            />
            <CommonModal
                api={`${process.env.NEXT_PUBLIC_API_URL}state/delete/${stateId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />

            <Modal show={showCityList} onHide={() => setSetShowCityList(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cities List</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>S.no</th>
                                <th>City Name</th>
                                <th>City Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cityList.map((city, index) => (
                                <tr key={city.id}>
                                    <td>{index + 1}</td>
                                    <td><b>{city.cityName}</b></td>
                                    <td>{city.cityDescription}</td>
                                    <td>
                                        <div className="d-flex mt-3 justify-content-center">
                                            <span className="d-inline-flex" role="presentation">
                                                <AdminTableDeleteIcon />
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal.Body>
            </Modal>
        </>
    )
}