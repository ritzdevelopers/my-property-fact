"use client";
import { faEye, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
export default function ManageGallery({ list, projectsList, newList }) {
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [show, setShow] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [galleryId, setGalleryId] = useState(0);
  const [popUpImageSrc, setPopUpImageSrc] = useState(null);
  const [imagePopUp, setImagePopUp] = useState(false);
  const [showImageList, setShowImageList] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [projectSlug, setProjectSlug] = useState("");
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [isProjectOptionsDisabled, setIsProjectOptionsDisabled] = useState(false);
  const handleShow = () => {
    setShow(true);
    setButtonName("Add");
    setTitle("Add Gallery Image");
    setDeletedImageIds([]);
    setImages([]);
    setProjectId(0);
    setValidated(false);
    setProjectOptions(newList);
    setIsProjectOptionsDisabled(false);
  };

  //Handling submitting gallery images
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("deletedImageIds", deletedImageIds);
    images
      .filter(img => img.file)
      .forEach(img => {
        if (img && typeof img.file.name === "string" && img.file.size && img.file.type) {
          formData.append("galleryImageList", img.file);
        }
      });
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (form.checkValidity() === true) {
      try {
        setShowLoading(true);
        setButtonName("");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}project-gallery/add-new`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.isSuccess === 1) {
          toast.success(response.data.message);
          router.refresh();
          setShow(false);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
      } finally {
        setShowLoading(false);
        setButtonName("Add");
      }
    }
  };

  //Handle delete
  const openImageList = (data) => {
    setProjectSlug(data.slugURL);
    setImageList(data.galleryImage);
    setShowImageList(true);
  };
  //Opening image popup to view image
  const openImagePopUp = (src) => {
    setPopUpImageSrc(src);
    setImagePopUp(true);
  };

  const openEditModel = (data) => {
    setProjectOptions(projectsList);
    setIsProjectOptionsDisabled(true);
    setTitle("Edit Gallery Image");
    setButtonName("Update");
    setProjectId(data.projectId);
    setDeletedImageIds([]);
    // Bind existing images
    const formatted = data.galleryImage.map((img) => ({
      id: img.id,
      preview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${data.slugURL}/${img.image}`,
      isNew: false
    }));

    setImages(formatted);
    setShow(true);
  };

  const deleteGalleryImage = (id) => {
    setConfirmBox(true);
    setGalleryId(id);
    setShowImageList(false);
  };
  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    { field: "pName", headerName: "Project Name", width: 200 },
    {
      field: "image",
      headerName: "Gallery Image",
      flex: 1,
      renderCell: (params) => (
        <>
          {params.row.galleryImage.map((item, index) => (
            <Image
              className="mx-2 rounded-2 cursor-pointer"
              key={index}
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${params.row.slugURL}/${item.image}`}
              alt={`${params.row.pname}`}
              width={100}
              height={40}
              
              onClick={() =>
                openImagePopUp(
                  `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${params.row.slugURL}/${item.image}`
                )
              }
            />
          ))}
        </>
      ),
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div>
          <FontAwesomeIcon
            className="text-danger mx-2 cursor-pointer"
            icon={faEye}
            onClick={() => openImageList(params.row)}
          />
          <FontAwesomeIcon
            className="text-warning cursor-pointer"
            icon={faPencil}
            onClick={() => openEditModel(params.row)}
          />
        </div>
      ),
    },
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Add previews
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      if (removed.isNew === false) {
        setDeletedImageIds((prevIds) => {
          if (!prevIds.includes(removed.id)) {
            return [...prevIds, removed.id];
          }
          return prevIds;
        });
      }
      return updated;
    });
  };
  return (
    <div className="container_fluid">
      <DashboardHeader
        buttonName={"+ Add Gallery Image"}
        functionName={handleShow}
        heading={"Manage Project's Gallery"}
      />
      <div className="table-container">
        <DataTable
          columns={columns}
          list={list.map((item) => ({
            ...item,
            image: item.galleryImage.map((item) => item.image),
          }))}
        />
      </div>
      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e, images)}>
            {/* Project Selection */}
            <Form.Group md="4" controlId="selectProject">
              <Form.Label className="fw-bold">Select Project</Form.Label>
              <Form.Select
                aria-label="Default select example"
                onChange={(e) => setProjectId(e.target.value)}
                value={projectId}
                required
                disabled={isProjectOptionsDisabled}
              >
                <option value="">Select Project</option>
                {projectOptions.map((item) => (
                  <option
                    className="text-uppercase"
                    key={item.id}
                    value={item.id}
                  >
                    {item.projectName}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Project is required!
              </Form.Control.Feedback>
            </Form.Group>

            {/* Gallery Images */}
            <Form.Group className="mb-3 mt-4">
              <Form.Label className="fw-bold">Gallery Images</Form.Label>

              {/* Container */}
              <div className="p-3 border rounded" style={{ minHeight: "120px" }}>
                {images.length > 0 ? (
                  <div className="d-flex flex-wrap gap-3">
                    {images.map((img, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <Image
                          className="rounded-2 d-block my-2"
                          src={img.preview}
                          alt="preview"
                          width={200}
                          height={100}
                          
                          onClick={() => openImagePopUp(img.preview)}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            borderRadius: "50%",
                            padding: "0px 6px",
                          }}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No images selected</p>
                )}
              </div>

              {/* Add More Button */}
              <div className="mt-2">
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="imageUploadInput"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    document.getElementById("imageUploadInput").click()
                  }
                >
                  + Add More Images
                </Button>
              </div>

              <Form.Control.Feedback type="invalid">
                Gallery image is required!
              </Form.Control.Feedback>
            </Form.Group>

            {/* Submit */}
            <Button
              className="mt-3 btn btn-success"
              type="submit"
              disabled={showLoading}
            >
              {buttonName} <LoadingSpinner show={showLoading} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}project-gallery/delete/${galleryId}`}
      />
      <Modal
        size="lg"
        show={imagePopUp}
        onHide={() => setImagePopUp(false)}
        centered
      >
        <Modal.Body>
          {popUpImageSrc && (
            <Image
              className="rounded-2"
              src={popUpImageSrc}
              alt="pop-up-image"
              width={0}
              height={0}
              sizes="100vw"
              style={{
                height: "auto",
                width: "auto",
                maxWidth: "100%",
                maxHeight: "80vh",
              }}
              
            />
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showImageList}
        onHide={() => setShowImageList(false)}
        centered
      >
        <Modal.Body>
          <h3 className="mb-3 text-center">Manage Gallery Images</h3>
          {imageList.map((item, index) => (
            <div
              key={`${item}_${index}`}
              className="d-flex justify-content-around align-items-center gap-3"
            >
              <div>
                <h6>{index + 1}</h6>
              </div>
              <Image
                className="rounded-2 d-block my-2"
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${projectSlug}/${item.image}`}
                alt={projectSlug}
                width={200}
                height={100}
                
              />
              <div>
                <FontAwesomeIcon
                  className="text-danger"
                  icon={faTrash}
                  onClick={() => deleteGalleryImage(item.id)}
                />
              </div>
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
}
