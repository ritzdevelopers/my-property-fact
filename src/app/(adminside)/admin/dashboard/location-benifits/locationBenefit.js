"use client";
import { LoadingSpinner } from "@/app/(home)/contact-us/page";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { useRouter } from "next/navigation";
export default function LocationBenefit({ list, projectList }) {
  const router = useRouter();

  // Show all projects in table; projects with no benefits have empty locationBenefits so user can add from modal
  const mergedList = (projectList ?? []).map((project, index) => {
    const benefitsData = (list ?? []).find(
      (item) => Number(item.projectId) === Number(project.id)
    );
    return {
      projectId: project.id,
      projectName: project.projectName ?? project.name ?? "–",
      slugUrl: project.slugURL ?? project.slugUrl,
      locationBenefits: benefitsData?.locationBenefits ?? [],
      index: index + 1,
      id: project.id,
    };
  });
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
        formData.append("distance", distance);
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
              <Image
                className="mx-2"
                key={index}
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}nearby-benefit/${iconFile}`}
                alt={item}
                width={50}
                height={50}
              />
            );
          })}
        </>
      ),
    },
    {
      field: "benefitName",
      headerName: "Benefit Name",
      flex: 1,
    },
    {
      field: "distance",
      headerName: "Distance",
      flex: 1,
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
      <div className="table-container">
        <DataTable
          columns={columns}
          list={mergedList.map((item) => ({
            ...item,
            distance: (item.locationBenefits || []).map((lb) => lb.distance),
            benefitName: (item.locationBenefits || []).map((lb) => lb.benefitName),
          }))}
        />
      </div>

      {/* View All benefits modal */}
      <Modal show={selectedData !== null} onHide={closeViewAllModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Location Benefits – {selectedProjectName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Manage nearby benefits for this project</span>
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
                    <td>{item.distance ? `${item.distance.split(" ")[0]} ${item.distance.split(" ")[1] ?? "Km"}` : "–"}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditFromViewAll(item)}
                      >
                        <FontAwesomeIcon icon={faPencil} className="me-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteBenefit(item)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted mb-0">No location benefits for this project.</p>
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
