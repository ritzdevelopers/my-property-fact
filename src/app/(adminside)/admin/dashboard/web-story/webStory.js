"use client";
import { Button, Form, Modal } from "react-bootstrap";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { useState } from "react";
import CommonModal from "../common-model/common-model";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AdminGridActions,
  AdminGridImageThumb,
} from "../common-model/admin-grid-cells";

export default function WebStory({ categoryList, list }) {

    const [show, setShow] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [buttonName, setButtonName] = useState("Add Category");
    const [title, setTitle] = useState("");
    const [validated, setValidated] = useState(false);
    const [categoryId, setCategoryId] = useState(0);
    const router = useRouter();
    const [confirmBox, setConfirmBox] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        categoryId: 0,
        storyTitle: "",
        storyDescription: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [prevImage, setPrevImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    //Handling opening of add model
    const openAddModel = () => {
        setButtonName("Add Story");
        setShow(true);
        setTitle("Add web story");
        setCategoryId(0);
        setFormData({
            id: 0,
            categoryId: 0,
            storyTitle: "",
            storyDescription: "",
        })
        setValidated(false);
        setPrevImage(null);
    }

    //Handle opening of edit model
    const openEditPopUp = (data) => {
        setButtonName("Update Story");
        setShow(true);
        setTitle("Update web story");
        setFormData(data);
        setPrevImage(`${process.env.NEXT_PUBLIC_IMAGE_URL}web-story/${data.storyImage}`)
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
            setValidated(true);
            return;
        }

        setValidated(true);
        setShowLoading(true);

        const payload = new FormData();
        payload.append("id", formData.id);
        payload.append("categoryId", formData.categoryId);
        payload.append("storyTitle", formData.storyTitle);
        payload.append("storyDescription", formData.storyDescription);
        if (imageFile) {
            payload.append("image", imageFile);
        }


        // Simulating API Call
        try {
            setButtonName("");
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}web-story/add-update`,
                payload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (response.data.isSuccess === 1) {
                router.refresh();
                setShow(false);
                toast.success(response.data.message);
            } else {
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error("Error occured !")
        } finally {
            setShowLoading(false);
            setButtonName("Add Story");
        }

    };

    const truncateDesc = (text, max = 90) => {
        if (!text || typeof text !== "string") return "—";
        const t = text.trim();
        return t.length <= max ? t : `${t.slice(0, max)}…`;
    };

    const columns = [
        {
            field: "categoryName",
            headerName: "Category",
            flex: 0.8,
            minWidth: 120,
        },
        {
            field: "storyTitle",
            headerName: "Story title",
            flex: 1,
            minWidth: 160,
        },
        {
            field: "storyImage",
            headerName: "Story image",
            width: 130,
            sortable: false,
            renderCell: (params) => (
                <AdminGridImageThumb
                    src={
                        params.row.storyImage
                            ? `${process.env.NEXT_PUBLIC_IMAGE_URL}web-story/${params.row.storyImage}`
                            : null
                    }
                    alt={params.row.storyTitle || "Web story"}
                    onPreviewClick={(src, alt) => setImagePreview({ src, alt })}
                />
            ),
        },
        {
            field: "storyDescription",
            headerName: "Description",
            flex: 1,
            minWidth: 180,
            renderCell: (params) => truncateDesc(params.row.storyDescription),
        },
        {
            field: "role",
            headerName: "Role",
            width: 120,
            sortable: false,
            renderCell: () => "—",
        },
        {
            field: "action",
            headerName: "Action",
            width: 110,
            sortable: false,
            renderCell: (params) => (
                <AdminGridActions
                    onEdit={() => openEditPopUp(params.row)}
                    onDelete={() => openConfirmationBox(params.row.id)}
                />
            ),
        },
    ];

    return (
        <>
            <DashboardHeader
                buttonName={"+ Add New Story"}
                functionName={openAddModel}
                heading={"Manage web story"}
                pageStyle="executive"
            />
            <div>
                <DataTable columns={columns} list={list} />
            </div>

            <Modal
                show={!!imagePreview}
                onHide={() => setImagePreview(null)}
                centered
                contentClassName="admin-image-lightbox-modal"
                dialogClassName="admin-image-lightbox-dialog"
            >
                <Modal.Body className="admin-image-lightbox-body border-0 position-relative">
                    <button
                        type="button"
                        className="btn-close admin-image-lightbox-close"
                        aria-label="Close"
                        onClick={() => setImagePreview(null)}
                    />
                    {imagePreview ? (
                        <div className="admin-image-lightbox-inner">
                            <img
                                src={imagePreview.src}
                                alt={imagePreview.alt}
                                width={1200}
                                height={900}
                                className="admin-image-lightbox-img"
                            />
                        </div>
                    ) : null}
                </Modal.Body>
            </Modal>

            {/* Model for adding walkthrough */}
            <Modal show={show} onHide={() => setShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="categoryId">
                            <Form.Label>Select Category</Form.Label>
                            <Form.Select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categoryList.map((item, index) => (
                                    <option key={index} value={item.id}>
                                        {item.categoryName}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Category is required!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="storyTitle">
                            <Form.Label>Story Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="storyTitle"
                                placeholder="Enter Story Title"
                                value={formData.storyTitle}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Story Title is required!
                            </Form.Control.Feedback>
                        </Form.Group>
                        {prevImage && <img
                            src={prevImage}
                            height={150}
                            width={75}
                            alt="previous image"
                        />}
                        <Form.Group className="mb-3" controlId="storyImage">
                            <Form.Label>Story Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                onChange={handleFileChange}
                            />
                            <Form.Control.Feedback type="invalid">
                                Image is required!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="storyDescription">
                            <Form.Label>Story Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="storyDescription"
                                placeholder="Story Description"
                                value={formData.storyDescription}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Description is required!
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button className="btn btn-success" type="submit" disabled={showLoading}>
                            {buttonName} <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <CommonModal
                api={`${process.env.NEXT_PUBLIC_API_URL}web-story/delete/${categoryId}`}
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
            />
        </>
    )
}