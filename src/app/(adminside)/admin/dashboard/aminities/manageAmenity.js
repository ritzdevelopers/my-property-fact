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
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import {
  AdminGridActions,
  AdminGridImageThumb,
} from "../common-model/admin-grid-cells";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
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
    if (form.checkValidity() !== true) return;

    const token =
      typeof window !== "undefined" ? Cookies.get("token") : undefined;
    const authHeaders = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      setButtonName("");
      setShowLoading(true);

      /** Edit: backend expects POST /amenity/post + AmenityDto + optional amenityImage (not post-multiple-amenities). */
      if (formData.id > 0) {
        const fd = new FormData();
        fd.append("id", String(formData.id));
        fd.append("title", formData.title);
        fd.append("altTag", formData.altTag);
        if (formData.amenityImage) {
          fd.append("amenityImage", formData.amenityImage);
        }
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "amenity/post",
          fd,
          {
            withCredentials: true,
            headers: authHeaders,
          },
        );
        if (response.data.isSuccess === 1) {
          setFormData({
            title: "",
            altTag: "",
            amenityImage: null,
          });
          setShowModal(false);
          toast.success(response.data.message);
          router.refresh();
        } else {
          toast.error(response.data.message || "Update failed");
        }
        return;
      }

      /** Bulk add: only post-multiple-amenities with amenitiesFiles (title/alt come from filenames on server). */
      if (images.length === 0) {
        toast.error("Add at least one image for bulk upload.");
        return;
      }
      const fd = new FormData();
      images.forEach((img) => {
        fd.append("amenitiesFiles", img.file);
      });
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "amenity/post-multiple-amenities",
        fd,
        {
          withCredentials: true,
          headers: authHeaders,
        },
      );
      if (response.data.isSuccess === 1) {
        setFormData({
          title: "",
          altTag: "",
          amenityImage: null,
        });
        setImages([]);
        setShowModal(false);
        toast.success(response.data.message);
        router.refresh();
      } else {
        toast.error(response.data.message || "Save failed");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Request failed";
      toast.error(msg);
    } finally {
      setShowLoading(false);
      setButtonName(
        title === "Edit Amenity" ? "Update Amenity" : "Add Amenities",
      );
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
    setValidated(false);
    setImages([]);
    setPreviousImage(
      `${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${item.amenityImageUrl}`
    );
  };

  //Defining table columns (executive layout: checkbox + title + image + alt + role + actions)
  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "image",
      headerName: "Amenity Image",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <AdminGridImageThumb
          src={
            params.row.amenityImageUrl
              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}amenity/${params.row.amenityImageUrl}`
              : null
          }
          alt={params.row.altTag || ""}
          fit="contain"
        />
      ),
    },
    {
      field: "altTag",
      headerName: "Alt tag",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
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
          onEdit={() => openEditModel(params.row)}
          onDelete={() => openConfirmationBox(params.row.id)}
        />
      ),
    },
  ];

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add New Amenities"}
        functionName={openAddModel}
        heading={"Manage Amenities"}
        pageStyle="executive"
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
          {title === "Edit Amenity" ? (
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
                {previousImage ? (
                  <div className="mb-3">
                    <Image
                      src={previousImage}
                      alt="Current amenity"
                      width={100}
                      height={100}
                      unoptimized
                    />
                  </div>
                ) : null}
                <Form.Group
                  as={Col}
                  className="mb-3"
                  md="12"
                  controlId="validationCustomUsername"
                >
                  <InputGroup hasValidation>
                    <Form.Control
                      type="file"
                      name="amenityImage"
                      onChange={handleFileChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please choose an image.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Row>
              <Button variant="success" type="submit" disabled={showLoading}>
                {buttonName} <LoadingSpinner show={showLoading} />
              </Button>
            </Form>
          ) : (
            <Container className="mt-4">
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
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
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
          )}
        </Modal.Body>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}amenity/delete/${amenityId}`}
      />
    </>
  );
}
