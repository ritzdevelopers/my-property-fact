"use client";

import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { AdminGridImageThumb } from "../common-model/admin-grid-cells";

const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function adminMutationHeaders(isMultipart = false) {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getInitialFormData() {
  return {
    id: 0,
    cityName: "",
    slugURL: "",
    stateId: "",
    monumentName: "",
    monumentImage: "",
    cityDescription: "",
    cityHighlights: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    isActive: true,
  };
}

export default function City({ list, stateList }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [cityId, setCityId] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [title, setTitle] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData);
  const [monumentImageFile, setMonumentImageFile] = useState(null);
  const [monumentImagePreview, setMonumentImagePreview] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const openEditPopUp = (data) => {
    setTitle("Edit City");
    setButtonName("Update City");
    setShowModal(true);
    setValidated(false);
    setMonumentImageFile(null);
    setMonumentImagePreview(
      data.monumentImage
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}cities/${data.monumentImage}`
        : "",
    );
    setFormData({
      id: data.id || 0,
      cityName: data.cityName || "",
      slugURL: data.slugURL || "",
      stateId: data.stateId || "",
      monumentName: data.monumentName || "",
      monumentImage: data.monumentImage || "",
      cityDescription: data.cityDescription || "",
      cityHighlights: data.cityHighlights || "",
      metaTitle: data.metaTitle || "",
      metaKeywords: data.metaKeywords || "",
      metaDescription: data.metaDescription || "",
      isActive: data.isActive !== false,
    });
  };

  const openAddModel = () => {
    setFormData(getInitialFormData());
    setValidated(false);
    setCityId(0);
    setMonumentImageFile(null);
    setMonumentImagePreview("");
    setTitle("Add New City");
    setButtonName("Add City");
    setShowModal(true);
  };

  const openConfirmationDialog = (id) => {
    setConfirmBox(true);
    setCityId(id);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMonumentImageFile(file);
    setMonumentImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const submitLabel = formData.id ? "Update City" : "Add City";

    try {
      setButtonName("");
      setShowLoading(true);

      const payload = new FormData();
      payload.append("id", String(formData.id || 0));
      payload.append("cityName", formData.cityName || "");
      payload.append("slugURL", formData.slugURL || "");
      payload.append("stateId", String(formData.stateId || ""));
      payload.append("monumentName", formData.monumentName || "");
      payload.append("cityDescription", formData.cityDescription || "");
      payload.append("cityHighlights", formData.cityHighlights || "");
      payload.append("metaTitle", formData.metaTitle || "");
      payload.append("metaKeywords", formData.metaKeywords || "");
      payload.append("metaDescription", formData.metaDescription || "");
      payload.append("isActive", String(Boolean(formData.isActive)));

      if (monumentImageFile) {
        payload.append("monumentImageFile", monumentImageFile);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}city/save`,
        payload,
        {
          withCredentials: true,
          headers: adminMutationHeaders(true),
        },
      );

      if (response.data.isSuccess === 1) {
        router.refresh();
        setShowModal(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to save city";
      toast.error(message);
    } finally {
      setButtonName(submitLabel);
      setShowLoading(false);
    }

    setValidated(true);
  };

  const columns = [
    { field: "index", headerName: "S.no", width: 80, cellClassName: "centered-cell" },
    { field: "cityName", headerName: "City Name", flex: 1, minWidth: 140 },
    { field: "slugURL", headerName: "Slug", flex: 1, minWidth: 120 },
    {
      field: "monumentImage",
      headerName: "Monument",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <AdminGridImageThumb
          src={
            params.row.monumentImage
              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}cities/${params.row.monumentImage}`
              : null
          }
          alt={params.row.monumentName || `${params.row.cityName || "City"} monument`}
          onPreviewClick={(src, alt) => setImagePreview({ src, alt })}
        />
      ),
    },
    { field: "stateName", headerName: "State", flex: 1, minWidth: 120 },
    {
      field: "isActive",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <span className={params.row.isActive !== false ? "text-success" : "text-danger"}>
          {params.row.isActive !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
    { field: "metaTitle", headerName: "Meta Title", flex: 1, minWidth: 160 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openConfirmationDialog(params.row.id)}
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
    <div>
      <DashboardHeader
        heading="Manage Cities"
        buttonName="+ Add new city"
        functionName={openAddModel}
      />
      <div className="table-container">
        <DataTable list={list} columns={columns} />
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        scrollable
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="cityName">
                  <Form.Label>City Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    City Name is required
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="slugURL">
                  <Form.Label>City Slug</Form.Label>
                  <Form.Control
                    type="text"
                    name="slugURL"
                    placeholder="e.g. chennai"
                    value={formData.slugURL}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="stateId">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {stateList?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.stateName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    State is required
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="monumentName">
                  <Form.Label>Monument / Landmark Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="monumentName"
                    value={formData.monumentName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="monumentImage">
                  <Form.Label>Monument Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {monumentImagePreview ? (
                    <img
                      src={monumentImagePreview}
                      alt="Monument preview"
                      style={{
                        marginTop: 12,
                        width: "100%",
                        maxHeight: 180,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : null}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="isActive">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="isActive"
                    value={formData.isActive ? "true" : "false"}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: event.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3" controlId="cityDescription">
                  <Form.Label>City Description</Form.Label>
                  <Editor
                    value={formData.cityDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, cityDescription: value }))
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3" controlId="cityHighlights">
                  <Form.Label>Short Highlights / Facts</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="cityHighlights"
                    placeholder="Enter one highlight per line"
                    value={formData.cityHighlights}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="metaTitle">
                  <Form.Label>SEO Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3" controlId="metaKeywords">
                  <Form.Label>SEO Meta Keywords</Form.Label>
                  <Form.Control
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-3" controlId="metaDescription">
                  <Form.Label>SEO Meta Description</Form.Label>
                  <Editor
                    value={formData.metaDescription}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, metaDescription: value }))
                    }
                  />
                </Form.Group>
              </div>
            </div>
            <Button className="btn btn-success" type="submit" disabled={showLoading}>
              {buttonName}
              <LoadingSpinner show={showLoading} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <CommonModal
        api={`${process.env.NEXT_PUBLIC_API_URL}city/delete/${cityId}`}
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
      />

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
    </div>
  );
}


