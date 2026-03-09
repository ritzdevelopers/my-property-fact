"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
export default function ManageFloorPlans({ list, projectsList }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [planType, setPlanType] = useState("");
  const [area, setArea] = useState("");
  const [floorId, setFloorId] = useState(0);
  const [confirmBox, setConfirmBox] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const handleClose = () => setShow(false);

  const openAddFloorPlan = () => {
    setValidated(false);
    setButtonName("Add Floor Plan");
    setTitle("Add Floor Plan");
    setShow(true);
    setPlanType("");
    setArea("");
    setFloorId(0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // <-- always stop default reload
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      return;
    }

    if (isNaN(area)) {
      toast.error("Area should be in number");
      return;
    }

    let data = {
      projectId,
      planType,
      areaSqFt: area,
      floorId: floorId > 0 ? floorId : 0,
    };

    try {
      setShowLoading(true);
      setButtonName("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}floor-plans/add-update`,
        data
      );
      if (response.data.isSuccess == 1) {
        toast.success(response.data.message);
        router.refresh();
        setShow(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error Occured");
    } finally {
      setShowLoading(false);
      setButtonName("Add Floor Plan");
    }

    setValidated(true);
  };

  //Opening confirmation box
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setFloorId(id);
  };
  //Opening edit model which contains all plans
  const openEditModel = (item) => {
    setShowPlans(true);
    setProjectId(item.id);
  };

  //Opening of update floor plan model
  const openUpdateFloorPlan = (floorPlan) => {
    setShow(true);
    setArea(floorPlan.areaSqft);
    setTitle("Update Floor Plan");
    setButtonName("Update");
    setPlanType(floorPlan.planType);
    setFloorId(floorPlan.id);
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
    { field: "type", headerName: "Type", flex: 1 },
    {
      field: "areaSq",
      headerName: "Area(sqft)",
      flex: 1,
    },
    {
      field: "areaMt",
      headerName: "Area(mt)",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <div>
          <Button
            className="btn btn-success"
            onClick={() => openEditModel(params.row)}
          >
            Show Floor Plans
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <DashboardHeader
        functionName={openAddFloorPlan}
        heading={"Manage Floor Plans"}
      />
      <div className="table-container">
        <DataTable
          columns={columns}
          list={list
            .slice() // create a shallow copy to avoid mutating original list
            .sort((a, b) => {
              const nameA = a.projectName?.toLowerCase();
              const nameB = b.projectName?.toLowerCase();
              if (nameA < nameB) return -1;
              if (nameA > nameB) return 1;
              return 0;
            })
            .map((item, index) => ({
              id: item.projectId,
              projectName: item.projectName,
              index: index + 1,
              type: item.plans?.map((plan) => plan.planType).join(", ") || "",
              areaSq: item.plans?.map((plan) => plan.areaSqft).join(", ") || "",
              areaMt:
                item.plans
                  ?.map((plan) => plan.areaSqMt?.toFixed(2))
                  .join(", ") || "",
            }))}
        />
      </div>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="selectProject">
              <Form.Label>Select Project</Form.Label>
              <Form.Select
                aria-label="Default select example"
                onChange={(e) => setProjectId(e.target.value)}
                value={projectId}
                required
                disabled
              >
                <option value="">Select Project</option>
                {projectsList.map((item) => (
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
            <Form.Group md="4" controlId="floorPlan">
              <Form.Label>Floor Plan</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Plan name"
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Floor Plan is required !
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group md="4" controlId="enterArea">
              <Form.Label>Enter Area</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter Area(sqft)"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Area is required !
              </Form.Control.Feedback>
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
        api={`${process.env.NEXT_PUBLIC_API_URL}floor-plans/delete/${floorId}`}
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
      />
      <Modal
        show={showPlans}
        onHide={() => setShowPlans(false)}
        centered
        style={{ minHeight: "400px" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Floor Plans</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {list
            .filter((item) => item.projectId === projectId)
            .flatMap((item) => item.plans)
            .map((plan, index) => (
              <div
                key={plan.id || index}
                className="btn btn-success mb-3 mx-2 w-25"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div onClick={() => openUpdateFloorPlan(plan)}>
                    {plan.planType}
                  </div>
                  <FontAwesomeIcon
                    className="m-0 p-0 text-light bg-danger p-2 rounded-pill"
                    icon={faClose}
                    onClick={() => openConfirmationBox(plan.id)}
                  />
                </div>
              </div>
            ))}
          <Button className="mb-3 mx-2" onClick={openAddFloorPlan}>
            + Add New
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
