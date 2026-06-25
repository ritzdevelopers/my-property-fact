"use client";
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { buildCityMonumentImageUrl } from "@/lib/cityMonumentImageUrl";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import CommonModal from "../common-model/common-model";
import GenerateForm from "../common-model/generateForm";

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
  const [showBulkMonumentModal, setShowBulkMonumentModal] = useState(false);
  const [bulkMonumentZip, setBulkMonumentZip] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const openEditPopUp = (data) => {
    setTitle("Edit City");
    setButtonName("Update City");
    setShowModal(true);
    setFormData({
      id: data.id || 0,
      ...data,
    });
  };

  const openAddModel = () => {
    setFormData(getInitialFormData);
    setValidated(false);
    setCityId(0);
    setTitle("Add New City");
    setButtonName("Add City");
    setShowModal(true);
  };

  const openConfirmationDialog = (id) => {
    setConfirmBox(true);
    setCityId(id);
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        api={"city/add-new"}
      />
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
              Examples: <code>agra.jpg</code>, <code>noida-monument.png</code>,{" "}
              <code>delhi-landmark.webp</code>
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

