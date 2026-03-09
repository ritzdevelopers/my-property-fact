"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
// import { Paper } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
// import { Button, Form, Modal } from "react-bootstrap";
// import CommonModal from "./common-model";

export default function ImageUrlPopup({ confirmBox, setConfirmBox }) {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(null);
    const [buttonName, setButtonName] = useState("Submit");
    const [showLoading, setShowLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    const [blogContentImageList, setBlogContentImageList] = useState([]);
    const [formData, setFormData] = useState({
        file: null,
        altTag: '',
        imageWidth: '',
        imageHeight: ''
    });

    //Handle setting input fields values
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0] // store the File object
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    //handling form submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("file", formData.file);
                formDataToSend.append("altTag", formData.altTag);
                formDataToSend.append("imageWidth", formData.imageWidth);
                formDataToSend.append("imageHeight", formData.imageHeight);
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}blog-image/post`, formDataToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (response.data.isSuccess === 1) {
                    setShowModal(false);
                    toast.success(response.data.message);
                    fetchList();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error(error);
            }
        }
        setValidated(true);
    };

    //Handling opening of form model
    const openAddModel = () => {
        setShowModal(true);
        setTitle("Add Image");
        setButtonName("Submit");
        setValidated(false);
    }
    //Fetching content image list 
    const fetchList = async () => {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}blog-image/get`);
        const res = response.data.map((item, index) => ({
            ...item,
            index: index + 1,
            new_url: `${process.env.NEXT_PUBLIC_IMAGE_URL}blog/content-image/${item.image}`
        }));
        setBlogContentImageList(res);
    }
    useEffect(() => {
        fetchList();
    }, []);

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        {
            field: "image", headerName: "Image", width: 120,
            renderCell: (params) => (
                <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/content-image/${params.row.image}`}
                    alt={`${params.row.altTag}`}
                    width={100}
                    height={50}
                    style={{ borderRadius: '5px' }}
                />
            ),
        },
        {
            field: "new_url",
            headerName: "URL",
            width: 500,
        },
        { field: "altTag", headerName: "ALT", width: 150 },
        { field: "imageWidth", headerName: "Width(Px)", width: 100 },
        { field: "imageHeight", headerName: "Height (Px)", width: 100 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div>
                    <FontAwesomeIcon
                        className="mx-3 text-danger cursor-pointer"
                        style={{ cursor: "pointer" }}
                        icon={faTrash}
                    // onClick={() => openConfirmationBox(params.row.id)}
                    />
                    <FontAwesomeIcon
                        className="text-warning"
                        style={{ cursor: "pointer" }}
                        icon={faPencil}
                    // onClick={() => openEditModel(params.row)}
                    />
                </div>
            ),
        },
    ];

    const paginationModel = { page: 0, pageSize: 10 };
    return (
        <Modal size="xl" show={confirmBox} onHide={() => setConfirmBox(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Content Image Container</Modal.Title>
                <Button className="mx-3 btn btn-success" onClick={() => openAddModel()}>
                    + Add New
                </Button>
            </Modal.Header>
            <div>
                <div className="table-container">
                    <Paper sx={{ height: 550, width: "100%" }}>
                        <DataGrid
                            rows={blogContentImageList}
                            columns={columns}
                            initialState={{ pagination: { paginationModel } }}
                            pageSizeOptions={[10, 15, 20, 50]}
                            checkboxSelection
                            sx={{
                                border: 0,
                                "& .MuiDataGrid-columnHeader": {
                                    fontWeight: "bold", // Make headings bold
                                    fontSize: "16px", // Optional: Adjust size
                                    backgroundColor: "#68ac78", // Optional: Light background
                                },
                            }}
                        />
                    </Paper>
                </div>
                {/* Modal for adding image url */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form noValidate validated={validated} onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="blog_content_image">
                                {/* <Form.Label>Blog content image</Form.Label> */}
                                <Form.Control
                                    type="file"
                                    name="file"
                                    onChange={(e) => handleChange(e)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Image name is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="blog_content_alt_tag">
                                {/* <Form.Label>Alt tag</Form.Label> */}
                                <Form.Control
                                    type="text"
                                    placeholder="Enter alt tag"
                                    name="altTag"
                                    onChange={(e) => handleChange(e)}
                                    value={formData.altTag || ""}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Alt tag is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="blog_content_image_width">
                                {/* <Form.Label>Image width</Form.Label> */}
                                <Form.Control
                                    type="text"
                                    placeholder="Enter image width"
                                    name="imageWidth"
                                    onChange={(e) => handleChange(e)}
                                    value={formData.imageWidth || ""}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Width is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="blog_content_image_height">
                                {/* <Form.Label>Image height</Form.Label> */}
                                <Form.Control
                                    type="text"
                                    placeholder="Enter image height"
                                    name="imageHeight"
                                    onChange={(e) => handleChange(e)}
                                    value={formData.imageHeight || ""}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Height is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button className="btn btn-success" type="submit" disabled={showLoading}>
                                {buttonName} <LoadingSpinner show={showLoading} />
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                {/* Pass the necessary props to CommonModal */}
                {/* <CommonModal
                    confirmBox={confirmBox}
                    setConfirmBox={setConfirmBox}
                    api={api}
                    fetchAllHeadersList={fetchAllHeadersList}
                /> */}
            </div>
        </Modal>
    )
}