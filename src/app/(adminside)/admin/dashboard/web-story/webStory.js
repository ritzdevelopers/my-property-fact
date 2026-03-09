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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

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

    //Defining columns of category table
    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        { field: "categoryName", headerName: "Category Name", flex: 1 },
        { field: "storyTitle", headerName: "Story TItle", flex: 1 },
        { field: "storyDescription", headerName: "Story Description", flex: 1 },
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
                buttonName={"+ Add story"}
                functionName={openAddModel}
                heading={"Manage web story"}
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
                        {prevImage && <Image
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