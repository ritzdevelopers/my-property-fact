"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import CommonModal from "../common-model/common-model";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { AdminGridImageThumb } from "../common-model/admin-grid-cells";
import { useRouter } from "next/navigation";
import { formatDistanceKm, normalizeDistanceKm } from "@/lib/utils";

export default function LocationBenefit({ list, projectList }) {
  const router = useRouter();

  // Show all projects; sort rows with existing benefits to the top for visibility.
  const tableRows = useMemo(() => {
    return (projectList ?? [])
      .map((project) => {
        const benefitsData = (list ?? []).find(
          (item) => Number(item.projectId) === Number(project.id),
        );
        const locationBenefits = benefitsData?.locationBenefits ?? [];
        return {
          projectId: project.id,
          projectName: project.projectName ?? project.name ?? "–",
          slugUrl: project.slugURL ?? project.slugUrl,
          locationBenefits,
          benefitCount: locationBenefits.length,
          benefitName: locationBenefits
            .map((lb) => lb.benefitName)
            .filter((name) => name !== undefined && name !== null && String(name).trim()),
          distance: locationBenefits
            .map((lb) => lb.distance)
            .filter((value) => value !== undefined && value !== null && String(value).trim()),
          id: project.id,
        };
      })
      .sort((a, b) => {
        if (b.benefitCount !== a.benefitCount) {
          return b.benefitCount - a.benefitCount;
        }
        return String(a.projectName).localeCompare(String(b.projectName));
      })
      .map((item, index) => ({ ...item, index: index + 1 }));
  }, [list, projectList]);

  const projectsWithBenefits = tableRows.filter((row) => row.benefitCount > 0).length;
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [bName, setBname] = useState("");
  const [distance, setDistance] = useState("");
  const [confirmBox, setConfirmBox] = useState(false);
  const [id, setId] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [allBenefits, setAllBenefits] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const editItemRef = useRef(null);
  const [excelFile, setExcelFile] = useState(null);
  const [replaceBenefitsFromExcel, setReplaceBenefitsFromExcel] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (form.checkValidity() === true) {
      try {
        const formData = new FormData();
        formData.append("benefitName", bName);
        formData.append("distance", normalizeDistanceKm(distance));
        formData.append("projectId", projectId);
        if (id > 0) {
          formData.append("id", id);
        }
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}location-benefit/add-new`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          },
        );
        if (response.data.isSuccess == 1) {
          router.refresh();
          setShowModal(false);
          toast.success(response.data.message);
        }
      } catch (error) {
        toast.error("Error occured");
      } finally {
        setShowLoading(false);
        setButtonName("Add");
      }
    }
    setValidated(true);
  };

  const openAddModel = () => {
    setShowModal(true);
    setId(0);
    setDistance("");
    setBname("");
    setProjectId("");
    setTitle("Add New Location Benefit");
    setButtonName("Add");
    setValidated(false);
  };

  const openEditModel = (item) => {
    editItemRef.current = item;
    setShowModal(true);
    setBname(item.benefitName ?? "");
    setDistance(item.distance !== undefined && item.distance !== null ? item.distance.split(" ")[0] : "");
    setProjectId(item.projectId ?? "");
    setId(item.id ?? 0);
    setTitle("Edit Location Benefit");
    setButtonName("Update");
    setValidated(false);
  };

  // Ensure edit form fields (especially distance) are applied after modal opens
  useEffect(() => {
    if (showModal && id > 0 && editItemRef.current) {
      const item = editItemRef.current;
      setBname(String(item.benefitName ?? ""));
      setDistance(item.distance.split(" ")[0] ?? "");
      setProjectId(String(item.projectId ?? ""));
      editItemRef.current = null;
    }
  }, [showModal, id]);

  const openViewAllModal = (row) => {
    setSelectedData(row.locationBenefits ?? []);
    setSelectedProjectName(row.projectName ?? "Location Benefits");
    setSelectedProjectId(row.projectId ?? null);
  };

  const closeViewAllModal = () => {
    setSelectedData(null);
    setSelectedProjectName("");
    setSelectedProjectId(null);
  };

  const openAddBenefitForProject = () => {
    const projectIdToUse = selectedProjectId;
    closeViewAllModal();
    setId(0);
    setDistance("");
    setBname("");
    setProjectId(projectIdToUse ?? "");
    setTitle("Add nearby benefit");
    setButtonName("Add");
    setValidated(false);
    setShowModal(true);
  };

  const handleDeleteBenefit = (item) => {
    setId(item.id);
    setConfirmBox(true);
  };

  const handleEditFromViewAll = (item) => {
    const projectId = selectedProjectId ?? item.projectId;
    closeViewAllModal();
    openEditModel({ ...item, projectId });
  };

  const fetchAllBenefits = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/get-all`,
    );
    const res = response.data;
    setAllBenefits(res);
  };

  useEffect(() => {
    fetchAllBenefits();
  }, []);

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error("Choose an Excel file (.xlsx or .xls)");
      return;
    }
    setExcelUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      const q = replaceBenefitsFromExcel ? "?replaceExisting=true" : "";
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}nearby-benefit/upload-projects-location-benefits-excel${q}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (response.data?.isSuccess === 1) {
        toast.success("Data is uploaded");
        setExcelFile(null);
        router.refresh();
      } else {
        toast.error(response.data?.message || "Upload failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Upload failed",
      );
    } finally {
      setExcelUploading(false);
    }
  };

  // Match location text (e.g. "sms school") to benefit icon by checking if text contains the benefit name (e.g. "School")
  const fetchLocationBenefitImages = (name) => {
    if (!name || typeof name !== "string") return null;
    const nameLower = name.toLowerCase().trim();
    // Sort by benefitName length descending so "metro station" matches before "metro"
    const sorted = [...allBenefits].filter((b) => b.benefitName?.trim()).sort((a, b) => (b.benefitName?.length ?? 0) - (a.benefitName?.length ?? 0));
    const filteredRes = sorted.find((item) => nameLower.includes(item.benefitName.toLowerCase().trim()));
    return filteredRes?.benefitIcon ?? null;
  };

  //Defining table columns
  const columns = [
    { field: "index", headerName: "S.no", width: 100 },
    { field: "projectName", headerName: "Project Name", flex: 1 },
    {
      field: "image",
      headerName: "Benefit Image",
      flex: 1,
      renderCell: (params) => (
        <>
          {params.row.benefitName?.map((item, index) => {
            const iconFile = fetchLocationBenefitImages(item);
            if (!iconFile) return null;
            return (
              <span key={index} className="d-inline-flex align-items-center me-1">
                <AdminGridImageThumb
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}nearby-benefit/${iconFile}`}
                  alt={item}
                  fit="contain"
                />
              </span>
            );
          })}
        </>
      ),
    },
    {
      field: "benefitCount",
      headerName: "Benefits",
      width: 110,
      renderCell: (params) =>
        params.row.benefitCount > 0 ? params.row.benefitCount : "–",
    },
    {
      field: "benefitName",
      headerName: "Benefit Name",
      flex: 1,
      renderCell: (params) => {
        const names = Array.isArray(params.row.benefitName)
          ? params.row.benefitName
          : params.row.benefitName
            ? [params.row.benefitName]
            : [];
        const text = names.filter(Boolean).join(", ");
        return text || "–";
      },
    },
    {
      field: "distance",
      headerName: "Distance",
      flex: 1,
      renderCell: (params) => {
        const distances = Array.isArray(params.row.distance)
          ? params.row.distance
          : [params.row.distance];
        const formatted = distances
          .filter((value) => value !== undefined && value !== null && String(value).trim())
          .map((value) => formatDistanceKm(value));
        return formatted.length ? formatted.join(", ") : "–";
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div>
          <Button
            className="btn btn-sm btn-success"
            onClick={() => openViewAllModal(params.row)}
          >
            View All
          </Button>
        </div>
      ),
    },
  ];
  return (
    <>
      <DashboardHeader
        functionName={openAddModel}
        heading={"Manage Location Benefits"}
      />
      <div className="admin-bulk-import-panel">
        <h2 className="admin-bulk-import-panel__title">Bulk import from Excel</h2>
        <p className="admin-bulk-import-panel__help">
          Columns: <strong>Project</strong> (must match project name in the system), then{" "}
          <strong>School</strong>, <strong>Malls/ IT Park</strong>, <strong>Hospitals</strong>,{" "}
          <strong>Roads/ Highway</strong>, <strong>Famous for/ Metro</strong>,{" "}
          <strong>Airport/Famous places</strong>. Each cell:{" "}
          <code>Place-Name_7-Km</code> (hyphens in the name, distance before{" "}
          <code>-Km</code>). By default only projects with no location benefits are updated; check
          the box below to replace existing benefits for listed projects.
        </p>
        <Form onSubmit={handleExcelUpload} className="d-flex flex-wrap align-items-end gap-3">
          <Form.Group>
            <Form.Label>Excel file</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(ev) => setExcelFile(ev.target.files?.[0] ?? null)}
              disabled={excelUploading}
            />
          </Form.Group>
          <Form.Check
            type="checkbox"
            id="replace-benefits-excel"
            label="Replace existing location benefits"
            checked={replaceBenefitsFromExcel}
            onChange={(ev) => setReplaceBenefitsFromExcel(ev.target.checked)}
            disabled={excelUploading}
            className="mb-2"
          />
          <Button type="submit" variant="success" disabled={excelUploading}>
            {excelUploading ? "Uploading…" : "Upload & map to projects"}
          </Button>
        </Form>
      </div>
      <p className="admin-bulk-import-panel__help mb-3">
        <strong>{projectsWithBenefits}</strong> of <strong>{tableRows.length}</strong> projects
        have location benefits. Projects with benefits are listed first — use{" "}
        <strong>View All</strong> to edit, or search for a project without benefits to add new
        ones.
      </p>
      <div className="table-container">
        <DataTable columns={columns} list={tableRows} />
      </div>

      {/* View All benefits modal */}
      <Modal show={selectedData !== null} onHide={closeViewAllModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Location Benefits – {selectedProjectName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="admin-bulk-import-panel__help mb-0">Manage nearby benefits for this project</span>
            <Button variant="success" size="sm" onClick={openAddBenefitForProject}>
              + Set nearby benefit
            </Button>
          </div>
          {selectedData?.length > 0 ? (
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>S.no</th>
                  <th>Benefit Name</th>
                  <th>Distance (km)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedData.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{index + 1}</td>
                    <td>{item.benefitName}</td>
                    <td>{item.distance ? formatDistanceKm(item.distance) : "–"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditFromViewAll(item)}
                      >
                        <span className="d-inline-flex align-items-center me-1">
                          <AdminTableEditIcon width={16} height={16} />
                        </span>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBenefit(item)}
                      >
                        <span className="d-inline-flex align-items-center me-1">
                          <AdminTableDeleteIcon width={12} height={16} />
                        </span>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="admin-bulk-import-panel__help mb-0">No location benefits for this project.</p>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="selectPorject">
              <Form.Label>Select Project</Form.Label>
              <Form.Select
                aria-label="Default select example"
                onChange={(e) => setProjectId(e.target.value)}
                value={projectId}
                required
                disabled={id > 0}
              >
                <option value="">Select Project</option>
                {projectList.map((item) => (
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
                Project is required !
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="benefitName">
              <Form.Label>Nearby benefit name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter nearby benefit name"
                value={bName}
                onChange={(e) => setBname(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Benefit name is required !
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="distance">
              <Form.Label>Distance (in KM)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Distance"
                value={distance ?? ""}
                onChange={(e) => setDistance(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Distance is required !
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              className="btn btn-success"
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
        api={`${process.env.NEXT_PUBLIC_API_URL}location-benefit/delete/${id}`}
        fetchAllHeadersList={closeViewAllModal}
      />
    </>
  );
}
