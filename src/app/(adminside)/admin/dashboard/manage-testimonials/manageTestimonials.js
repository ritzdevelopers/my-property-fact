"use client";

import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";

function adminMutationHeaders() {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ManageTestimonials({ list, projectsList = [] }) {
  const getInitialFormData = () => ({
    id: 0,
    projectId: "",
    clientName: "",
    clientRole: "",
    testimonialText: "",
    status: true,
  });

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(null);
  const [buttonName, setButtonName] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);
  const [confirmBox, setConfirmBox] = useState(false);
  const [testimonialId, setTestimonialId] = useState(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const projectOptions = useMemo(
    () =>
      (Array.isArray(projectsList) ? projectsList : [])
        .filter((p) => p?.id && p?.projectName)
        .sort((a, b) =>
          String(a.projectName).localeCompare(String(b.projectName)),
        ),
    [projectsList],
  );

  const normalizedList = useMemo(() => {
    const map = new Map(
      projectOptions.map((p) => [Number(p.id), p.projectName]),
    );
    return (Array.isArray(list) ? list : []).map((item) => {
      const currentName = String(item?.projectName || "").trim();
      if (currentName) return item;
      const resolvedName = map.get(Number(item?.projectId));
      return resolvedName
        ? { ...item, projectName: resolvedName }
        : item;
    });
  }, [list, projectOptions]);

  const openAddModel = () => {
    setShowModal(true);
    setValidated(false);
    setTitle("Add New Testimonial");
    setButtonName("Add Testimonial");
    setFormData(getInitialFormData);
  };

  const openEditModel = (item) => {
    setShowModal(true);
    setValidated(false);
    setTitle("Edit Testimonial");
    setButtonName("Update Testimonial");
    setFormData({
      id: item.id || 0,
      projectId: item.projectId || "",
      clientName: item.clientName || "",
      clientRole: item.clientRole || "",
      testimonialText: item.testimonialText || "",
      status: item.status !== false,
    });
  };

  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setTestimonialId(id);
  };

  const truncCell = (val, max = 100) => {
    const s = val == null ? "—" : String(val).trim() || "—";
    return (
      <span
        title={s}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
          maxWidth: "100%",
        }}
      >
        {s.length > max ? `${s.slice(0, max)}…` : s}
      </span>
    );
  };

  const columns = [
    { field: "index", headerName: "S.no", width: 80, cellClassName: "centered-cell" },
    { field: "projectName", headerName: "Project", width: 220, renderCell: (p) => truncCell(p.value, 55) },
    { field: "clientName", headerName: "Client Name", width: 220 },
    { field: "clientRole", headerName: "Role", width: 220, renderCell: (p) => truncCell(p.value, 50) },
    { field: "testimonialText", headerName: "Testimonial", flex: 1, minWidth: 280, renderCell: (p) => truncCell(p.value, 120) },
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
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="d-inline-flex align-items-center" style={{ gap: 8 }}>
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openEditModel(params.row)}
            role="presentation"
          >
            <AdminTableEditIcon />
          </span>
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openConfirmationBox(params.row.id)}
            role="presentation"
          >
            <AdminTableDeleteIcon />
          </span>
        </div>
      ),
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const selectedProject = projectOptions.find(
      (project) => Number(project.id) === Number(formData.projectId),
    );

    const payload = {
      id: formData.id || 0,
      projectId: Number(formData.projectId),
      projectName: selectedProject?.projectName || "",
      clientName: formData.clientName?.trim(),
      clientRole: formData.clientRole?.trim() || "",
      testimonialText: formData.testimonialText?.trim(),
      status: Boolean(formData.status),
    };

    try {
      setButtonName("");
      setShowLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}testimonial/post`,
        payload,
        {
          withCredentials: true,
          headers: adminMutationHeaders(),
        },
      );
      if (response.data?.isSuccess === 1) {
        toast.success(response.data.message || "Testimonial saved successfully.");
        setShowModal(false);
        router.refresh();
      } else {
        toast.error(response.data?.message || "Unable to save testimonial.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save testimonial.",
      );
    } finally {
      setShowLoading(false);
      setButtonName(formData.id ? "Update Testimonial" : "Add Testimonial");
    }
  };

  return (
    <div>
      <DashboardHeader
        buttonName={"+ Add New Testimonial"}
        functionName={openAddModel}
        heading={"Manage Testimonials"}
      />

      <div>
        <DataTable columns={columns} list={normalizedList} />
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="projectId">
              <Form.Label>Project</Form.Label>
              <Form.Select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
              >
                <option value="">Select project</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectName}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Project is required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientName">
              <Form.Label>Client name</Form.Label>
              <Form.Control
                name="clientName"
                type="text"
                placeholder="Enter client name"
                value={formData.clientName}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Client name is required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientRole">
              <Form.Label>Client role/designation</Form.Label>
              <Form.Control
                name="clientRole"
                type="text"
                placeholder="Enter role/designation"
                value={formData.clientRole}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="testimonialText">
              <Form.Label>Testimonial text</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="testimonialText"
                placeholder="Write testimonial"
                value={formData.testimonialText}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Testimonial text is required.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="testimonialStatus">
              <Form.Check
                type="checkbox"
                name="status"
                checked={Boolean(formData.status)}
                onChange={handleChange}
                label="Active (show on home page)"
              />
            </Form.Group>

            <Button className="btn btn-success" type="submit" disabled={showLoading}>
              {buttonName}
              <LoadingSpinner show={showLoading} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${apiUrl}testimonial/delete/${testimonialId}`}
      />
    </div>
  );
}
