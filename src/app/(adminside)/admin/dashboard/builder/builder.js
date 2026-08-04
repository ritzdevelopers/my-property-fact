"use client";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "../../_lib/adminToast";
import { Button, Form, Modal } from "react-bootstrap";
import { getPublicApiBase } from "@/lib/publicApiBase";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import GenerateForm from "../common-model/generateForm";
import DashboardHeader from "../common-model/dashboardHeader";

function galleryCountFromRow(row) {
  const raw = row?.developerGalleryImagesJson;
  if (raw == null || String(raw).trim() === "") return 0;
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function builderMediaImageUrl(slugUrl, filename) {
  if (!slugUrl || !filename) return "";
  const base = getPublicApiBase();
  if (!base) return "";
  return `${base}get/images/builders/${encodeURIComponent(slugUrl)}/${encodeURIComponent(filename)}`;
}

export default function Builder({ list }) {
  const router = useRouter();
  //Defining from fields for builder
  const inputFields = [
    {
      id: "builderName",
      label: "Builder name",
      type: "text",
    },
    {
      id: "builderDesc",
      label: "Builder description",
      type: "editor",
    },
    {
      id: "metaTitle",
      label: "Meta title",
      type: "text",
    },
    {
      id: "metaKeyword",
      label: "Meta keyword",
      type: "textarea",
    },
    {
      id: "metaDesc",
      label: "Meta description",
      type: "editor",
    },
  ];

  const getInitialFormData = () =>
    Object.fromEntries(inputFields.map((item) => [item.id, ""]));
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [id, setId] = useState(0);
  const [confirmBox, setConfirmBox] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaRow, setMediaRow] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [galleryZip, setGalleryZip] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [showBulkLogoModal, setShowBulkLogoModal] = useState(false);
  const [bulkLogoZip, setBulkLogoZip] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  //Handling opening of edit builer form
  const openEditPopUp = (data) => {
    setFormData({
      ...data,
      id: data.id,
    });
    setTitle("Edit Builder");
    setButtonName("Update Builder");
    setShowModal(true);
  };

  //Handling opening of new add builder form
  const openAddModel = () => {
    setValidated(false);
    setFormData(getInitialFormData);
    setTitle("Add Builder");
    setButtonName("Add Builder");
    setShowModal(true);
  };

  const openConfirmationBox = (rowId) => {
    setConfirmBox(true);
    setId(rowId);
  };

  const openMediaModal = (row) => {
    setMediaRow(row);
    setLogoFile(null);
    setGalleryZip(null);
    setShowMediaModal(true);
  };

  const submitDeveloperMedia = async (e) => {
    e.preventDefault();
    if (!mediaRow?.id) return;
    if (!logoFile && !galleryZip) {
      toast.error("Choose a logo image and/or a gallery .zip file.");
      return;
    }
    const apiBase = getPublicApiBase();
    const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
    if (!apiBase) {
      toast.error("API URL is not configured.");
      return;
    }
    setMediaUploading(true);
    try {
      const data = new FormData();
      data.append("builderId", String(mediaRow.id));
      if (logoFile) data.append("logo", logoFile);
      if (galleryZip) data.append("galleryZip", galleryZip);
      const res = await axios.post(`${apiBase}builder/upload-developer-media`, data, {
        withCredentials: true,
        headers: {
        },
      });
      if (res.data?.isSuccess === 1) {
        toast.success(res.data.message || "Saved.");
        setShowMediaModal(false);
        setMediaRow(null);
        router.refresh();
      } else {
        toast.error(res.data?.message || "Upload failed.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed.";
      toast.error(typeof msg === "string" ? msg : "Upload failed.");
    } finally {
      setMediaUploading(false);
    }
  };

  const submitBulkLogoZip = async (e) => {
    e.preventDefault();
    if (!bulkLogoZip) {
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
      data.append("logosZip", bulkLogoZip);
      const res = await axios.post(`${apiBase}builder/upload-builder-logos-zip`, data, {
        withCredentials: true,
        headers: {
        },
      });
      if (res.data?.isSuccess === 1) {
        toast.success(res.data.message || "Bulk upload done.");
        setShowBulkLogoModal(false);
        setBulkLogoZip(null);
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

  //Defining table columns
  const columns = [
    { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
    { field: "builderName", headerName: "Builder Name", flex: 1 },
    {
      field: "builderLogo",
      headerName: "Logo",
      width: 100,
      cellClassName: "centered-cell",
      renderCell: (params) => {
        const slug = params.row.slugUrl;
        const file = params.row.builderLogo;
        const src = builderMediaImageUrl(slug, file);
        if (!src) return <span className="text-muted small">—</span>;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 6 }}
          />
        );
      },
    },
    {
      field: "galleryCount",
      headerName: "Gallery",
      width: 90,
      cellClassName: "centered-cell",
      renderCell: (params) => galleryCountFromRow(params?.row || {}),
    },
    { field: "metaTitle", headerName: "Meta title", flex: 1 },
    {
      field: "metaKeyword",
      headerName: "Meta Keyword",
      flex: 1,
    },
    {
      field: "metaDesc",
      headerName: "Meta Description",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openConfirmationBox(params.row.id)}
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
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            className="py-0 px-2"
            onClick={() => openMediaModal(params.row)}
          >
            Media
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <DashboardHeader
        heading={"Manage Builders"}
        buttonName={"+ Add Builder"}
        functionName={openAddModel}
        exportExcel={"Bulk logo ZIP Upload"}
        exportIconType="add"
        exportFunction={() => {
          setBulkLogoZip(null);
          setShowBulkLogoModal(true);
        }}
      />
      <div className="table-container">
        <DataTable columns={columns} list={list} />
      </div>
      <GenerateForm
        buttonName={buttonName}
        formData={formData}
        inputFields={inputFields}
        setButtonName={setButtonName}
        setShowLoading={setShowLoading}
        setShowModal={setShowModal}
        setValidated={setValidated}
        showLoading={showLoading}
        showModal={showModal}
        title={title}
        validated={validated}
        setFormData={setFormData}
        api={"builder/add-update"}
      />
      <CommonModal
        api={`${process.env.NEXT_PUBLIC_API_URL}builder/delete/${id}`}
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
      />

      <Modal show={showMediaModal} onHide={() => !mediaUploading && setShowMediaModal(false)} centered>
        <Modal.Header closeButton={!mediaUploading}>
          <Modal.Title>
            Developer media
            {mediaRow?.builderName ? ` — ${mediaRow.builderName}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitDeveloperMedia}>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Upload a logo (image file) and/or a <strong>.zip</strong> of images (jpg, png, webp, gif). Gallery ZIP
              replaces the previous gallery for this builder. Files are stored under{" "}
              <code>builders/{mediaRow?.slugUrl ?? "slug"}/</code>.
            </p>
            {mediaRow?.builderLogo && mediaRow?.slugUrl ? (
              <div className="mb-3 d-flex align-items-center gap-2">
                <span className="small text-muted">Current logo:</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={builderMediaImageUrl(mediaRow.slugUrl, mediaRow.builderLogo)}
                  alt=""
                  style={{ maxHeight: 48, objectFit: "contain" }}
                />
              </div>
            ) : null}
            {galleryCountFromRow(mediaRow || {}) > 0 ? (
              <p className="small mb-3">
                Current gallery: <strong>{galleryCountFromRow(mediaRow || {})}</strong> image(s)
              </p>
            ) : null}
            <Form.Group className="mb-3">
              <Form.Label>Logo (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                disabled={mediaUploading}
                onChange={(ev) => setLogoFile(ev.target.files?.[0] ?? null)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Gallery ZIP (optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".zip,application/zip"
                disabled={mediaUploading}
                onChange={(ev) => setGalleryZip(ev.target.files?.[0] ?? null)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" disabled={mediaUploading} onClick={() => setShowMediaModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={mediaUploading}>
              {mediaUploading ? "Uploading…" : "Upload"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showBulkLogoModal} onHide={() => !bulkUploading && setShowBulkLogoModal(false)} centered>
        <Modal.Header closeButton={!bulkUploading}>
          <Modal.Title>Bulk builder logo upload</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitBulkLogoZip}>
          <Modal.Body>
            <p className="small text-muted mb-2">
              Upload one ZIP containing all builder logos. Each image file name should match builder slug/name.
            </p>
            <p className="small text-muted mb-3">
              Example: <code>saya-homes.jpg</code> or <code>saya-homes-logo.png</code>
            </p>
            <Form.Group>
              <Form.Label>Logos ZIP</Form.Label>
              <Form.Control
                type="file"
                accept=".zip,application/zip"
                disabled={bulkUploading}
                onChange={(ev) => setBulkLogoZip(ev.target.files?.[0] ?? null)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" disabled={bulkUploading} onClick={() => setShowBulkLogoModal(false)}>
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
