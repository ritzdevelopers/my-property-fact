"use client";
import { useState } from "react";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import GenerateForm from "../common-model/generateForm";

export default function ManageBlogCategory({ list }) {
    //Defining form fields for blog category
    const inputFields = [
        {
            id: "categoryName",
            label: "Category name"
        },
        {
            id: "categoryDescription",
            label: "Category description"
        }
    ];
    const getInitialFormData = () => Object.fromEntries(inputFields.map(item => [item.id, ""]));
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(null);
    const [buttonName, setButtonName] = useState(null);
    const [showLoading, setShowLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData);
    const [confirmBox, setConfirmBox] = useState(false);
    const [catId, setCatId] = useState(0);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    //Handling opening of add model
    const openAddModel = () => {
        setShowModal(true);
        setValidated(false);
        setTitle("Add New Category");
        setButtonName("Add Category");
        setFormData(getInitialFormData);
    }

    // Handle deletion of blog category
    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setCatId(id);
    }

    //Handling edition of Blog category
    const openEditModel = (item) => {
        setShowModal(true);
        setTitle("Edit Blog Category");
        setButtonName("Update Blog Category");
        setFormData({
            ...item,
            id: item.id || 0
        });
    }

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        {
            field: "categoryName",
            headerName: "Category Name",
            width: 450,
        },
        { field: "categoryDescription", headerName: "Category Description", width: 570 },
        {
            field: "action",
            headerName: "Action",
            width: 250,
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
            <DashboardHeader buttonName={'+ Add New Category'} functionName={openAddModel} heading={'Manage Blog Categories'} />
            {/* Table containing all the blog categories */}
            <div>
                <DataTable columns={columns} list={list} />
            </div>
            {/* Generating from for blog category  */}
            <GenerateForm
                api={"blog-category/add-update"}
                buttonName={buttonName}
                formData={formData}
                inputFields={inputFields}
                setButtonName={setButtonName}
                setFormData={setFormData}
                setShowLoading={setShowLoading}
                setShowModal={setShowModal}
                setValidated={setValidated}
                showLoading={showLoading}
                showModal={showModal}
                title={title}
                validated={validated}
            />

            <CommonModal confirmBox={confirmBox} setConfirmBox={setConfirmBox}
                api={`${apiUrl}blog-category/delete/${catId}`} />
        </div>
    );
}