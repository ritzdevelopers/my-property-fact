"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { useRouter } from "next/navigation";

// Dynamically import JoditEditor with SSR disabled
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function ManageProjectWalkthrough({ list, projectList, projectWithWalkthrough }) {
    const editor = useRef(null);
    const router = useRouter();
    const [walkthroughDesc, setWalkthroughDesc] = useState("");
    const [projectId, setProjectId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [buttonName, setButtonName] = useState("");
    const [confirmBox, setConfirmBox] = useState(false);
    const [validated, setValidated] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [walkthroughId, setWalkthroughId] = useState(0);
    const [projectListOptions, setProjectListOptions] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    //Handling submition of from
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            walkthroughDesc: walkthroughDesc,
            projectId: projectId,
            id: 0
        };
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if (form.checkValidity() === true) {
            if (walkthroughId > 0) {
                data.id = walkthroughId;
            }
            try {
                setShowLoading(true);
                setButtonName("");
                const response = await axios.post(
                    `${apiUrl}project-walkthrough/add-update`,
                    data
                );
                if (response.data.isSuccess === 1) {
                    router.refresh();
                    toast.success(response.data.message);
                    setShowModal(false);
                    fetchProjects();
                }
            } catch (error) {
                toast.error(error);
            } finally {
                setShowLoading(false);
                setButtonName("Add");
            }
        }
    };

    //Handle open model
    const openAddModal = () => {
        setValidated(false);
        setShowModal(true);
        setTitle("Add Walkthrough");
        setButtonName("Add");
        setWalkthroughDesc(null);
        setProjectId(0);
        setProjectListOptions(projectList.filter((project) => !projectWithWalkthrough.includes(project.id)));
        setIsDisabled(false);
    };

    //Handle deleting walkthrough
    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setWalkthroughId(id);
    };

    const openEditPopUp = (item) => {        
        setShowModal(true);
        setTitle("Update Walkthrough");
        setButtonName("Update");
        setWalkthroughDesc(item.walkthroughDesc);
        setProjectId(item.projectId);
        setWalkthroughId(item.id);
        setProjectListOptions(projectList.filter((project) => projectWithWalkthrough.includes(project.id)));
        setIsDisabled(true);
    };
    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        { field: "projectName", headerName: "Project Name", flex: 1 },
        { field: "walkthroughDesc", headerName: "Walkthrough Description", flex: 1 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="gap-3">
                    <FontAwesomeIcon
                        className="text-warning pointer mx-2"
                        style={{ cursor: "pointer" }}
                        icon={faPencil}
                        onClick={() => openEditPopUp(params.row)}
                    />
                </div>
            ),
        },
    ];
    return (
        <div className="container-fluid">
            <DashboardHeader buttonName={'+ Add Walkthrough'} functionName={openAddModal} heading={'Manage Project Walkthrough'} />
            {/* Show All data in tabular form */}
            <div>
                <DataTable columns={columns} list={list} />
            </div>
            {/* Model for adding walkthrough */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group controlId="selectProject">
                            <Form.Label>Select Project</Form.Label>
                            <Form.Select
                                aria-label="projects"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                required
                                disabled={isDisabled}
                            >
                                <option value="">Select Project</option>
                                {projectListOptions.map((item) => (
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
                        <Form.Group className="mb-3 mt-4" controlId="formCityName">
                            <Form.Label>Walkthrough description</Form.Label>
                            <JoditEditor
                                ref={editor}
                                value={walkthroughDesc}
                                onChange={(newcontent) => setWalkthroughDesc(newcontent)}
                            />
                        </Form.Group>
                        <Button className="btn btn-success" type="submit" disabled={showLoading}>
                            {buttonName} <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <CommonModal confirmBox={confirmBox} setConfirmBox={setConfirmBox} api={`${process.env.NEXT_PUBLIC_API_URL}project-walkthrough/delete/${walkthroughId}`} />
        </div>
    );
}
