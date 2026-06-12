"use client";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CommonModal from "../common-model/common-model";
import {
  AdminFilterCount,
  AdminSummaryFilterCards,
  ContentStatusPill,
} from "../common-model/admin-summary-filter-cards";
import {
  WEB_STORY_CATEGORY_FILTERS,
  countWebStoryCategories,
  filterWebStoryCategories,
  getWebStoryCategoryRowClassName,
} from "../common-model/adminContentFilters";

export default function WebStroyCategory({ list }) {

    const [show, setShow] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [buttonName, setButtonName] = useState("Add Category");
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [title, setTitle] = useState("");
    const [validated, setValidate] = useState(false);
    const [categoryId, setCategoryId] = useState(0);
    const router = useRouter();
    const [confirmBox, setConfirmBox] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const categoryCounts = useMemo(() => countWebStoryCategories(list), [list]);
    const filteredCategoryList = useMemo(
        () => filterWebStoryCategories(list, statusFilter),
        [list, statusFilter],
    );
    const activeCategoryFilter = WEB_STORY_CATEGORY_FILTERS.find((item) => item.id === statusFilter);
    //Handling opening of add model
    const openAddModel = () => {
        setButtonName("Add Category");
        setShow(true);
        setTitle("Add web story category");
        setCategoryName("");
        setCategoryDescription("");
        setMetaDescription("");
        setMetaKeywords("");
        setCategoryId(0);
    }

    //Handle opening of edit model
    const openEditPopUp = (data) => {
        setButtonName("Update Category");
        setShow(true);
        setTitle("Update web story category");
        setCategoryName(data.categoryName);
        setCategoryDescription(data.categoryDescription);
        setMetaDescription(data.metaDescription ?? "");
        setMetaKeywords(data.metaKeywords ?? "");
        setCategoryId(data.id);
    }

    const openConfirmationBox = (id) => {
        setCategoryId(id);
        setConfirmBox(true);
    }

    //Submitting web story category
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidate(true);
            return;
        } else {
            try {
                setShowLoading(true);
                var data = {
                    "categoryName": categoryName,
                    "categoryDescription": categoryDescription,
                    "metaDescription": metaDescription,
                    "metaKeywords": metaKeywords,
                    "id": categoryId
                }
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}web-story-category/add-update`,
                    data
                );
                if (response.data.isSuccess === 1) {
                    setShow(false);
                    toast.success(response.data.message);
                    router.refresh();
                }
            } catch (error) {
                toast.error(error?.message ?? "Request failed");
            } finally {
                setButtonName("Add Category");
                setShowLoading(false);
            }
        }
    }

    //Defining columns of category table
    const truncCell = (val, max = 60) => {
        const s = val == null ? "—" : String(val).trim() || "—";
        return (
            <span title={s} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "100%" }}>
                {s.length > max ? `${s.slice(0, max)}…` : s}
            </span>
        );
    };

    const columns = [
        { field: "index", headerName: "S.no", width: 80 },
        { field: "categoryName", headerName: "Category Name", width: 160, renderCell: (p) => truncCell(p.value, 20) },
        { field: "categoryDescription", headerName: "Category Description", flex: 1, minWidth: 160, renderCell: (p) => truncCell(p.value) },
        { field: "metaDescription", headerName: "Meta description", flex: 1, minWidth: 160, renderCell: (p) => truncCell(p.value) },
        { field: "metaKeywords", headerName: "Meta keywords", flex: 1, minWidth: 160, renderCell: (p) => truncCell(p.value) },
        { field: "noOfStories", headerName: "No of Stories", width: 110 },
        {
            field: "contentStatus",
            headerName: "Status",
            width: 130,
            sortable: false,
            renderCell: (params) => {
                const count = Number(params.row.noOfStories ?? 0);
                return (
                    <ContentStatusPill variant={count > 0 ? "active" : "pending"}>
                        {count > 0 ? `${count} stories` : "Empty"}
                    </ContentStatusPill>
                );
            },
        },
        { field: "storyUrl", headerName: "Story URL", flex: 1, minWidth: 140, renderCell: (p) => truncCell(p.value) },
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
        <>
            <DashboardHeader
                buttonName={"+ Add story category"}
                functionName={openAddModel}
                heading={"Manage web story category"}
            />
            <div className="manage-users-page">
                <AdminSummaryFilterCards
                    filters={WEB_STORY_CATEGORY_FILTERS}
                    activeFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                    counts={categoryCounts}
                    ariaLabel="Filter web story categories"
                />
                <div className="manage-users-toolbar mb-2">
                    <AdminFilterCount
                        filteredCount={filteredCategoryList.length}
                        totalCount={Array.isArray(list) ? list.length : 0}
                        activeFilter={statusFilter}
                        activeFilterLabel={activeCategoryFilter?.shortLabel}
                        onClear={() => setStatusFilter("all")}
                    />
                </div>
            </div>
            <div>
                <DataTable
                    columns={columns}
                    list={filteredCategoryList}
                    getRowClassName={getWebStoryCategoryRowClassName}
                    dataGridSx={{
                        "& .MuiDataGrid-row.mu-row--pending .MuiDataGrid-cell:first-of-type": {
                            boxShadow: "inset 3px 0 0 #f59e0b",
                        },
                        "& .MuiDataGrid-row.mu-row--active .MuiDataGrid-cell:first-of-type": {
                            boxShadow: "inset 3px 0 0 rgba(34, 197, 94, 0.55)",
                        },
                    }}
                />
            </div>

            {/* Model for adding walkthrough */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="categoryName">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Category Name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Category Name is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="categoryDescription">
                            <Form.Label>Category description</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Category Description"
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="metaDescription">
                            <Form.Label>Meta description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="SEO meta description (optional)"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="metaKeywords">
                            <Form.Label>Meta keywords</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="comma separated keywords (optional)"
                                value={metaKeywords}
                                onChange={(e) => setMetaKeywords(e.target.value)}
                            />
                        </Form.Group>
                        <Button className="btn btn-success" type="submit" disabled={showLoading}>
                            {buttonName} <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <CommonModal 
                api={`${process.env.NEXT_PUBLIC_API_URL}web-story-category/delete/${categoryId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </>
    )
}