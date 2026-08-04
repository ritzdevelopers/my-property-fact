"use client";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { buildCityMonumentImageUrl } from "@/lib/cityMonumentImageUrl";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import CommonModal from "../common-model/common-model";

const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function normalizeEditorHtml(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withoutTags = raw
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
  return withoutTags;
}

function buildCitySaveFormData(formData, monumentImageFile) {
  const data = new FormData();
  data.append("id", String(formData.id || 0));
  data.append("stateId", String(formData.stateId || ""));

  const textFields = [
    "cityName",
    "monumentName",
    "metaTitle",
    "metaKeywords",
    "metaDescription",
    "cityDescription",
    "slugURL",
  ];

  textFields.forEach((key) => {
    const value = formData[key];
    if (value !== undefined && value !== null) {
      data.append(key, String(value));
    }
  });

  if (monumentImageFile) {
    data.append("monumentImageFile", monumentImageFile);
  }

  return data;
}

export default function City({ list, stateList }) {
  const router = useRouter();
  const inputFields = [
    {
      id: "cityName",
      label: "City Name",
      type: "text",
    },
    {
      id: "stateId",
      label: "State Name",
      type: "select",
      list: stateList,
    },
    {
      id: "monumentName",
      label: "Monument Name",
      type: "text",
    },
    {
      id: "metaTitle",
      label: "Meta Title",
      type: "text",
    },
    {
      id: "metaKeywords",
      label: "Meta Keywords",
      type: "text",
    },
    {
      id: "metaDescription",
      label: "Meta Description",
      type: "editor",
    },
    {
      id: "cityDescription",
      label: "City Description",
      type: "editor",
    },
  ];
  const getInitialFormData = () =>
    Object.fromEntries(inputFields.map((item) => [item.id, ""]));
  const [showModal, setShowModal] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [cityId, setCityId] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [title, setTitle] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData);
  const [editorErrors, setEditorErrors] = useState({});
  const [monumentImageFile, setMonumentImageFile] = useState(null);
  const [showBulkMonumentModal, setShowBulkMonumentModal] = useState(false);
  const [bulkMonumentZip, setBulkMonumentZip] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const resetFormModal = () => {
    setMonumentImageFile(null);
    setEditorErrors({});
    setValidated(false);
  };

  const openEditPopUp = (data) => {
    resetFormModal();
    setTitle("Edit City");
    setButtonName("Update City");
    setShowModal(true);
    setFormData({
      id: data.id || 0,
      ...data,
      stateId: data.stateId ?? "",
    });
  };

  const openAddModel = () => {
    resetFormModal();
    setFormData(getInitialFormData());
    setCityId(0);
    setTitle("Add New City");
    setButtonName("Add City");
    setShowModal(true);
  };

  const openConfirmationDialog = (id) => {
    setConfirmBox(true);
    setCityId(id);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nextEditorErrors = {};
    inputFields
      .filter((item) => item.type === "editor" && item.required !== false)
      .forEach((item) => {
        if (!normalizeEditorHtml(formData[item.id])) {
          nextEditorErrors[item.id] = `${item.label} is required !`;
        }
      });
    setEditorErrors(nextEditorErrors);

    if (Object.keys(nextEditorErrors).length > 0) {
      setValidated(true);
      return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const apiBase = getPublicApiBase();
    const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
    if (!apiBase) {
      toast.error("API URL is not configured.");
      return;
    }

    const submitLabel = buttonName;
    setButtonName("");
    setShowLoading(true);

    try {
      const payload = buildCitySaveFormData(formData, monumentImageFile);
      const response = await axios.post(`${apiBase}city/save`, payload, {
        withCredentials: true,
        headers: {
        },
      });

      if (response.data?.isSuccess === 1) {
        router.refresh();
        setShowModal(false);
        resetFormModal();
        toast.success(response.data.message || "City saved.");
      } else {
        toast.error(response.data?.message || "Failed to save city.");
      }
    } catch (error) {
      const d = error.response?.data;
      const msg =
        (typeof d === "string" ? d : null) ||
        d?.message ||
        d?.error ||
        error.message ||
        "Request failed";
      toast.error(msg);
    } finally {
      setButtonName(submitLabel);
      setShowLoading(false);
    }
  };

  const submitBulkMonumentZip = async (e) => {
    e.preventDefault();
    if (!bulkMonumentZip) {
      toast.error("Choose a .zip file first.");
      return;
    }
    const apiBase = getPublicApiBase();
    const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
    if (!apiBase) {
      toast.error("API URL is not configured.");
      return;
    }
    setBulkUploading(true);
    try {
      const data = new FormData();
      data.append("monumentsZip", bulkMonumentZip);
      const res = await axios.post(`${apiBase}city/upload-city-monuments-zip`, data, {
        withCredentials: true,
        headers: {
        },
      });
      if (res.data?.isSuccess === 1) {
        toast.success(res.data.message || "Bulk upload done.");
        setShowBulkMonumentModal(false);
        setBulkMonumentZip(null);
        router.refresh();
      } else {
        toast.error(res.data?.message || "Bulk upload failed.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Bulk upload failed.";
      toast.error(typeof msg === "string" ? msg : "Bulk upload failed.");
    } finally {
      setBulkUploading(false);
    }
  };

  const currentMonumentPreview = monumentImageFile
    ? URL.createObjectURL(monumentImageFile)
    : formData.monumentImage
      ? buildCityMonumentImageUrl(formData.monumentImage)
      : "";

  const columns = [
    { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
    { field: "cityName", headerName: "City Name", flex: 1 },
    { field: "stateName", headerName: "State", flex: 1 },
    {
      field: "monumentImage",
      headerName: "Monument",
      width: 110,
      cellClassName: "centered-cell",
      renderCell: (params) => {
        if (!params.row.monumentImage) {
          return <span className="text-muted small">—</span>;
        }
        const src = buildCityMonumentImageUrl(params.row.monumentImage);
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={params.row.monumentName || params.row.cityName || "Monument"}
            style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 6 }}
          />
        );
      },
    },
    { field: "monumentName", headerName: "Monument Name", flex: 1 },
    { field: "cityDescription", headerName: "City Description", flex: 1 },
    { field: "countryName", headerName: "Country", flex: 1 },
    {
      field: "metaTitle",
      headerName: "Meta Title",
      flex: 1,
    },
    {
      field: "metaKeywords",
      headerName: "Meta Keyword",
      flex: 1,
    },
    {
      field: "metaDescription",
      headerName: "Meta Description",
      flex: 1,
    },
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
        heading={"Manage Cities"}
        buttonName={"+ Add new city"}
        functionName={openAddModel}
        exportExcel={"Bulk monument ZIP upload"}
        exportIconType="add"
        exportFunction={() => {
          setBulkMonumentZip(null);
          setShowBulkMonumentModal(true);
        }}
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
            {inputFields.map((item, index) => (
              <div key={`${item.id}-${index}`}>
                {item.type === "text" || item.type === "number" ? (
                  <Form.Group className="mb-3" controlId={item.id}>
                    <Form.Label>{item.label}</Form.Label>
                    <Form.Control
                      type={item.type}
                      placeholder={`Enter ${item.label}`}
                      value={formData[item.id] || ""}
                      onChange={handleChange}
                      required={item.id === "cityName"}
                    />
                    <Form.Control.Feedback type="invalid">
                      {`${item.label} is required !`}
                    </Form.Control.Feedback>
                  </Form.Group>
                ) : item.type === "select" ? (
                  <Form.Group className="mb-3" controlId={item.id}>
                    <Form.Label>{item.label}</Form.Label>
                    <Form.Select
                      name={item.id}
                      value={formData[item.id] || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select {item.label}</option>
                      {item.list?.map((option, idx) => (
                        <option key={idx} value={option.id}>
                          {option.stateName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {`${item.label} is required!`}
                    </Form.Control.Feedback>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3" controlId={item.id}>
                    <Form.Label>{item.label}</Form.Label>
                    <Editor
                      value={formData[item.id] || ""}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, [item.id]: value }))
                      }
                    />
                    {editorErrors[item.id] ? (
                      <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                        {editorErrors[item.id]}
                      </div>
                    ) : null}
                  </Form.Group>
                )}
              </div>
            ))}

            <Form.Group className="mb-3" controlId="monumentImageFile">
              <Form.Label>City monument image</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(ev) => setMonumentImageFile(ev.target.files?.[0] ?? null)}
              />
              <Form.Text className="text-muted">
                Upload a landmark image for this city (JPG, PNG, or WebP). Works for all cities
                including Ghaziabad, Lucknow, etc.
              </Form.Text>
              {currentMonumentPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentMonumentPreview}
                  alt={formData.cityName ? `${formData.cityName} monument preview` : "Monument preview"}
                  style={{
                    display: "block",
                    marginTop: 12,
                    width: 160,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : null}
            </Form.Group>

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
        show={showBulkMonumentModal}
        onHide={() => !bulkUploading && setShowBulkMonumentModal(false)}
        centered
      >
        <Modal.Header closeButton={!bulkUploading}>
          <Modal.Title>Bulk city monument upload</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitBulkMonumentZip}>
          <Modal.Body>
            <p className="small text-muted mb-2">
              Upload one ZIP containing monument/landmark images for cities. Each image file name
              should match the city slug or name.
            </p>
            <p className="small text-muted mb-3">
              Examples: <code>agra.jpg</code>, <code>ghaziabad.jpg</code>,{" "}
              <code>lucknow-monument.png</code>
            </p>
            <Form.Group>
              <Form.Label>Monuments ZIP</Form.Label>
              <Form.Control
                type="file"
                accept=".zip,application/zip"
                disabled={bulkUploading}
                onChange={(ev) => setBulkMonumentZip(ev.target.files?.[0] ?? null)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              type="button"
              disabled={bulkUploading}
              onClick={() => setShowBulkMonumentModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={bulkUploading}>
              {bulkUploading ? "Uploading…" : "Upload ZIP"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
