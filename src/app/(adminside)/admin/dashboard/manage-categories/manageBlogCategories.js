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
    const truncCell = (val, max = 70) => {
        const s = val == null ? "—" : String(val).trim() || "—";
        return (
            <span title={s} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "100%" }}>
                {s.length > max ? `${s.slice(0, max)}…` : s}
            </span>
        );
    };

    const columns = [
        { field: "index", headerName: "S.no", width: 80, cellClassName: "centered-cell" },
        { field: "categoryName", headerName: "Category Name", width: 200 },
        { field: "categoryDescription", headerName: "Category Description", flex: 1, minWidth: 200, renderCell: (p) => truncCell(p.value) },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <button
                        type="button"
                        style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 7, background: "#dc2626", cursor: "pointer" }}
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); openConfirmationBox(params.row.id); }}
                    >
                        <img src="/images/admin/delete.svg" alt="" width={12} height={15} style={{ filter: "brightness(10)", pointerEvents: "none" }} />
                    </button>
                    <button
                        type="button"
                        style={{ width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", borderRadius: 7, background: "#2563eb", cursor: "pointer" }}
                        title="Edit"
                        onClick={(e) => { e.stopPropagation(); openEditModel(params.row); }}
                    >
                        <img src="/images/admin/edit.svg" alt="" width={14} height={14} style={{ filter: "brightness(10)", pointerEvents: "none" }} />
                    </button>
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