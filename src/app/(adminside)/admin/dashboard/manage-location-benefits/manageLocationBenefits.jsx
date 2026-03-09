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

export default function ManageLocationBenefits({ allBenefits }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [confirmBox, setConfirmBox] = useState(false);
  const [benefitId, setBenefitId] = useState(0);
  const [images, setImages] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Saving the benefit data
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (images.length === 0) {
      toast.error("Please select at least one nearby benefit icon image.");
      return;
    }

    const formDataToSend = new FormData();
    images.forEach((img) => {
      formDataToSend.append("nearbyBenefitsFiles", img.file);
    });

    try {
      setButtonName("");
      setShowLoading(true);
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "nearby-benefit/post-multiple-nearby-benefits",
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
      toast.error(error?.response?.data?.message || error?.message || "Error saving nearby benefits");
    } finally {
      setShowLoading(false);
      setButtonName("Add Nearby Benefits");
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
    setBenefitId(id);
  };

  // Handling opening of add popup
  const openAddModel = () => {
    setTitle("Add Nearby Benefit Icons");
    setButtonName("Add Nearby Benefits");
    setShowModal(true);
    setImages([]);
  };

  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    {
      field: "benefitName",
      headerName: "Benefit Name",
      flex: 1,
      cellClassName: "text-capitalize",
    },
    { 
      field: "benefitIcon", 
      headerName: "Benefit Icon", 
      flex: 1,
      renderCell: (params) => (
        params.row.benefitIcon ? (
          <Image 
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}nearby-benefit/${params.row.benefitIcon}`}
            width={50}
            height={50}
            alt={params.row.altTag || params.row.benefitName || ""}
          />
        ) : (
          <span>N/A</span>
        )
      )
    },
    {
      field: "altTag",
      headerName: "Alt Tag",
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.altTag || "N/A"}</span>
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
      {/* header section  */}
      <DashboardHeader
        buttonName={"+ Add new nearby benefit"}
        functionName={openAddModel}
        heading={"Manage Nearby Benefits"}
      />

      {/* table section  */}
      <div>
        <DataTable columns={columns} list={allBenefits} />
      </div>
      
      {/* Modal for adding nearby benefits */}
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
                + Add Multiple Nearby Benefit Icons
              </div>
              <div className="mb-3">
                <small className="text-muted">
                  Upload multiple nearby benefit icons. Benefit name and alt tag will be automatically generated from the image filename.
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
        api={`${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/delete/${benefitId}`}
      />
    </>
  );
}