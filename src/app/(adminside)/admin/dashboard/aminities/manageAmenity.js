"use client";
import { useRef, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  InputGroup,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function ManageAminity({ list }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [previousImage, setPreviousImage] = useState("");
  const [confirmBox, setConfirmBox] = useState(false);
  const [amenityId, setAmenityId] = useState(0);
  const [images, setImages] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    altTag: "",
    amenityImage: null,
  });

  //Saving the amenity data
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      return;
    }
    if (form.checkValidity() === true) {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("altTag", formData.altTag);
      formDataToSend.append("amenityImage", formData.amenityImage);
      images.forEach((img) => {
        formDataToSend.append("amenitiesFiles", img.file);
      });
      if (formData.id > 0) {
        formDataToSend.append("id", formData.id);
      }
      try {
        setButtonName("");
        setShowLoading(true);
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "amenity/post-multiple-amenities",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.isSuccess == 1) {
          setFormData({
            title: "",
            altTag: "",
            amenityImage: null,
          });
          setShowModal(false);
          toast.success(response.data.message);
          router.refresh();
        }else{
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error?.data?.message);
      } finally {
        setShowLoading(false);
        setButtonName("Add Amenities");
      }
    }
  };
  // Handle image file selection
  const handleFileChange = (e) => {
    const { files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      amenityImage: files[0],
    }));
  };

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Handle change for text input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //Handle confirmation dilog
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setAmenityId(id);
  };

  //Handling opening of add popup
  const openAddModel = () => {
    setFormData({
      title: "",
      altTag: "",
      amenityImage: null,
    });
    setPreviousImage(null);
    setTitle("Add Amenity List");
    setButtonName("Add Amenities");
    setShowModal(true);
    setValidated(false);
    setImages([]);
  };

  //Handling opening of edit model
  const openEditModel = (item) => {
    setTitle("Edit Amenity");
    setButtonName("Update Amenity");
    setFormData({
      ...item,
      amenityImage: null,
    });
    setShowModal(true);
    setPreviousImage(
      `${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${item.amenityImageUrl}`
    );
  };

  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "image",
      headerName: "Amenity Image",
      flex: 1,
      renderCell: (params) => (
        <Image
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${params.row.amenityImageUrl}`}
          alt={params.row.altTag || ""}
          width={50}
          height={50}
        />
      ),
    },
    {
        field: "altTag",
        headerName: "Alt tag",
        flex: 1
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div>
          <FontAwesomeIcon
            className="mx-3 text-danger"
            style={{ cursor: "pointer" }}
            icon={faTrash}
            onClick={() => openConfirmationBox(params.row.id)}
          />
          {/* <FontAwesomeIcon
            className="text-warning"
            style={{ cursor: "pointer" }}
            icon={faPencil}
            onClick={() => openEditModel(params.row)}
          /> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add new amenity"}
        functionName={openAddModel}
        heading={"Manage Amenities"}
      />
      <div>
        <DataTable columns={columns} list={list} />
      </div>
      {/* Modal for adding a new city */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container className="mt-4">
            {/* Image Previews */}
            <Row className="mb-3">
              {images.map((img, index) => (
                <Col
                  key={index}
                  xs={6}
                  md={3}
                  className="mb-3 position-relative"
                >
                  <img
                    src={img.preview}
                    alt={`preview-${index}`}
                    className="img-fluid rounded shadow"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ✕
                  </Button>
                </Col>
              ))}
            </Row>
            <Form onSubmit={handleSubmit}>
              {/* Hidden File Input */}
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              {/* Custom Upload Box */}
              <div
                onClick={handleBoxClick}
                style={{
                  border: "2px dashed #337936ff",
                  borderRadius: "10px",
                  padding: "30px",
                  textAlign: "center",
                  cursor: "pointer",
                  color: "#066c25ff",
                  fontWeight: "500",
                  marginBottom: "20px",
                }}
              >
                + Add Multiple Images
              </div>
              <Button variant="success" type="submit" disabled={showLoading}>
                {buttonName} <LoadingSpinner show={showLoading} />
              </Button>
            </Form>
          </Container>
        </Modal.Body>
      </Modal>
      {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group
                                as={Col}
                                className="mb-3"
                                md="12"
                                controlId="validationCustom01"
                            >
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group
                                as={Col}
                                className="mb-3"
                                md="12"
                                controlId="validationCustom02"
                            >
                                <Form.Control
                                    required
                                    type="text"
                                    placeholder="Alt Tag"
                                    name="altTag"
                                    value={formData.altTag}
                                    onChange={handleChange}
                                />
                                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                            </Form.Group>
                            {previousImage && (
                                <div>
                                    <Image
                                        src={previousImage}
                                        alt="previous image"
                                        width={100}
                                        height={100}
                                    />
                                    <br />
                                </div>
                            )}
                            <Form.Group
                                as={Col}
                                className="mb-3"
                                md="12"
                                controlId="validationCustomUsername"
                            >
                                <InputGroup hasValidation>
                                    <Form.Control
                                        type="file"
                                        placeholder="Username"
                                        aria-describedby="inputGroupPrepend"
                                        name="amenityImage"
                                        onChange={handleFileChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please choose a Image.
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Row>
                        <Button className="btn btn-success" type="submit" disabled={showLoading}>{buttonName} <LoadingSpinner show={showLoading} /></Button>
                    </Form>
                </Modal.Body>
            </Modal> */}
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}amenity/delete/${amenityId}`}
      />
    </>
  );
}
