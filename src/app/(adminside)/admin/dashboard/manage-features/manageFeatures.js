"use client";
import { useRef, useState } from "react";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ManageFeatures({ list }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [confirmBox, setConfirmBox] = useState(false);
  const [featureId, setFeatureId] = useState(0);
  const [images, setImages] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Saving the feature data
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (images.length === 0) {
      toast.error("Please select at least one feature icon image.");
      return;
    }

    const formDataToSend = new FormData();
    images.forEach((img) => {
      formDataToSend.append("featuresFiles", img.file);
    });

    try {
      setButtonName("");
      setShowLoading(true);
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "feature/post-multiple-features",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.isSuccess == 1) {
        setImages([]);
        setShowModal(false);
        toast.success(response.data.message);
        router.refresh();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Error saving features");
    } finally {
      setShowLoading(false);
      setButtonName("Add Features");
    }
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
    // Revoke the object URL to free memory
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview);
    }
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  // Handle confirmation dialog
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setFeatureId(id);
  };

  // Handling opening of add popup
  const openAddModel = () => {
    setTitle("Add Feature Icons");
    setButtonName("Add Features");
    setShowModal(true);
    setImages([]);
  };

  // Defining table columns
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
      headerName: "Feature Icon",
      flex: 1,
      renderCell: (params) => (
        params.row.iconImageUrl ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}feature/${params.row.iconImageUrl}`}
            alt={params.row.altTag || params.row.title || ""}
            width={50}
            height={50}
          />
        ) : (
          <span>N/A</span>
        )
      ),
    },
    {
      field: "altTag",
      headerName: "Alt tag",
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.altTag || "N/A"}</span>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.description || "N/A"}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span className={params.row.status ? "text-success" : "text-danger"}>
          {params.row.status ? "Active" : "Inactive"}
        </span>
      ),
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
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add new feature"}
        functionName={openAddModel}
        heading={"Manage Features"}
      />
      <div>
        <DataTable columns={columns} list={list} />
      </div>
      {/* Modal for adding features */}
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
                + Add Multiple Feature Icons
              </div>
              <div className="mb-3">
                <small className="text-muted">
                  Upload multiple feature icons. Title and alt tag will be automatically generated from the image filename.
                </small>
              </div>
              <Button variant="success" type="submit" disabled={showLoading}>
                {buttonName} <LoadingSpinner show={showLoading} />
              </Button>
            </Form>
          </Container>
        </Modal.Body>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}feature/delete/${featureId}`}
      />
    </>
  );
}
