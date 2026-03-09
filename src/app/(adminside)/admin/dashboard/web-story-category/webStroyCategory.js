"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import CommonModal from "../common-model/common-model";

export default function WebStroyCategory({ list }) {

    const [show, setShow] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [buttonName, setButtonName] = useState("Add Category");
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [title, setTitle] = useState("");
    const [validated, setValidate] = useState(false);
    const [categoryId, setCategoryId] = useState(0);
    const router = useRouter();
    const [confirmBox, setConfirmBox] = useState(false);
    //Handling opening of add model
    const openAddModel = () => {
        setButtonName("Add Category");
        setShow(true);
        setTitle("Add web story category");
        setCategoryName("");
        setCategoryDescription("");
        setCategoryId(0);
    }

    //Handle opening of edit model
    const openEditPopUp = (data) => {
        setButtonName("Update Category");
        setShow(true);
        setTitle("Update web story category");
        setCategoryName(data.categoryName);
        setCategoryDescription(data.categoryDescription);
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
                toast.error(error.message());
            } finally {
                setButtonName("Add Category");
                setShowLoading(false);
            }
        }
    }

    //Defining columns of category table
    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        { field: "categoryName", headerName: "Category Name", flex: 1 },
        { field: "categoryDescription", headerName: "Category Description", flex: 1 },
        { field: "noOfStories", headerName: "No of Stories", flex: 1 },
        { field: "storyUrl", headerName: "Story URL", flex: 1 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="gap-3">
                    <FontAwesomeIcon
                        className="text-danger mx-2"
                        style={{ cursor: "pointer" }}
                        icon={faTrash}
                        onClick={() => openConfirmationBox(params.row.id)}
                    />
                    <FontAwesomeIcon
                        className="text-warning pointer mx-2"
                        style={{ cursor: "pointer" }}
                        icon={faPencil}
                        onClick={() => openEditPopUp(params.row)}
                    />
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
            <div>
                <DataTable columns={columns} list={list} />
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