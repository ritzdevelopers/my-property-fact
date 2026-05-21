"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Multiselect from "multiselect-react-dropdown";
import { AdminTableEditIcon } from "../common-model/admin-table-icons";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import { useRouter } from "next/navigation";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import Cookies from "js-cookie";

const apiWithAuth = () => ({
  withCredentials: true,
  headers: {
    ...(typeof window !== "undefined" && Cookies.get("token")
      ? { Authorization: `Bearer ${Cookies.get("token")}` }
      : {}),
  },
});

export default function ProjectsAmenity({
  projectList,
  amenityList,
  projectIdsWithAmenity = [],
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [validated, setValidated] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [confirmBox, setConfirmBox] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState([]);
  const [showAmenityError, setShowAmenityError] = useState(false);
  const [projectListOptions, setProjectListOptions] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [amenitiesName, setAmenitiesName] = useState("");

  useEffect(() => {
    projectList.forEach(async (item) => {
      const amenities = await fetchProjectAmenities(item.id);
      item.amenitiesName = amenities.map((item) => item.title).join(", ");
    });
  }, [projectList]);

  // Handler for selecting an option
  const onSelect = (selectedList) => {
    setSelectedValue(selectedList); // Update selected values state
  };
  // Handler for removing an option
  const onRemove = (removedList) => {
    setSelectedValue(removedList); // Update selected values state
  };
  const openAddModel = () => {
    setIsDisabled(false);
    setProjectId("");
    setSelectedValue([]);
    setProjectListOptions(
      projectList
        .filter((item) => !projectIdsWithAmenity.includes(item.id))
        .sort((a, b) =>
          (a.projectName ?? "").localeCompare(b.projectName ?? ""),
        ),
    );
    setValidated(false);
    setShowAmenityError(false);
    setShowModal(true);
    setTitle("Add Project Amenity");
    setButtonName("Add");
  };

  //Handling submitting form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      amenityList: selectedValue,
      projectId: projectId,
    };
    if (form.checkValidity() === false || selectedValue.length === 0) {
      e.stopPropagation();
      if (selectedValue.length === 0) {
        setShowAmenityError(true);
      }
    } else {
      try {
        setShowLoading(true);
        setButtonName("");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}projects/add-update-amenity`,
          data,
          apiWithAuth(),
        );
        if (response.data.isSuccess === 1) {
          router.refresh();
          toast.success(response.data.message);
          setShowModal(false);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const statusCode = error?.response?.status;
        const message =
          error?.response?.data?.message ||
          (statusCode === 403
            ? "Permission denied: you need project management access."
            : "Failed to update project amenities.");
        toast.error(message);
      } finally {
        setShowLoading(false);
        setButtonName("Add");
      }
    }
    setValidated(true);
  };
  // Fetch project's amenities
  const fetchProjectAmenities = async (projectId) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}amenity/get-by-project-id/${projectId}`,
      apiWithAuth(),
    );
    return response.data;
  };
  const openEditPopUp = async (item) => {
    const amenities = await fetchProjectAmenities(item.id);
    setSelectedValue(amenities);
    setProjectListOptions(projectList);
    setIsDisabled(true);
    setShowModal(true);
    setTitle("Update Project Amenity");
    setButtonName("Update");
    setProjectId(item.id);
  };

  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    { field: "projectName", headerName: "Project Name", flex: 1 },
    { field: "amenitiesName", headerName: "Amenities", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div className="d-inline-flex">
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
    <>
      <DashboardHeader
        buttonName={"+ Add Project Amenity"}
        functionName={openAddModel}
        heading={"Manage Project & Amenity"}
      />
      <div className="table-container">
        <DataTable columns={columns} list={projectList} />
      </div>
      {/* Modal for adding a new city */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="selectAmenityForProject">
              <Form.Label>
                <b>Select Project</b>
              </Form.Label>
              <Form.Select
                aria-label="Default select example"
                onChange={(e) => setProjectId(e.target.value)}
                value={projectId}
                required
                disabled={isDisabled}
              >
                <option value="">Select Project</option>
                {projectListOptions.map((item) => (
                  <option
                    className="text-capitalize"
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
            <Form.Group className="mt-3">
              <Form.Label>
                <b>Select Amenities</b>
              </Form.Label>
              <Multiselect
                options={amenityList}
                selectedValues={selectedValue}
                onSelect={onSelect}
                onRemove={onRemove}
                displayValue="title"
                className={
                  showAmenityError
                    ? "border border-danger rounded rounded-1"
                    : ""
                }
              />
              {showAmenityError && (
                <div className="text-danger mt-1">
                  At least one amenity is required!
                </div>
              )}
            </Form.Group>
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
        api={`${process.env.NEXT_PUBLIC_API_URL}project-amenity/delete/${projectId}`}
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
      />
    </>
  );
}
