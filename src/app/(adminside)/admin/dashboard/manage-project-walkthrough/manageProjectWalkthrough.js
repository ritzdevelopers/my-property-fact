"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "../../_lib/adminToast";
import { AdminTableEditIcon } from "../common-model/admin-table-icons";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DashboardHeader from "../common-model/dashboardHeader";
import DataTable from "../common-model/data-table";
import { useRouter } from "next/navigation";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        const data = {
            walkthroughDesc: walkthroughDesc || "",
            projectId: Number(projectId),
            id: walkthroughId > 0 ? walkthroughId : 0,
        };

        try {
            setShowLoading(true);
            setButtonName("");
            const response = await axios.post(
                `${apiUrl}project-walkthrough/add-update`,
                data
            );
            if (response.data.isSuccess === 1) {
                toast.success(response.data.message);
                setShowModal(false);
                router.refresh();
            } else {
                toast.error(response.data.message || "Failed to save walkthrough.");
            }
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save walkthrough.";
            toast.error(message);
        } finally {
            setShowLoading(false);
            setButtonName(walkthroughId > 0 ? "Update" : "Add");
        }
    };

    const openAddModal = () => {
        setValidated(false);
        setShowModal(true);
        setTitle("Add Walkthrough");
        setButtonName("Add");
        setWalkthroughDesc("");
        setProjectId("");
        setWalkthroughId(0);
        setProjectListOptions(
            projectList.filter((project) => !projectWithWalkthrough.includes(project.id))
        );
        setIsDisabled(false);
    };

    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setWalkthroughId(id);
    };

    const openEditPopUp = async (item) => {
        setValidated(false);
        setShowModal(true);
        setTitle("Update Walkthrough");
        setButtonName("Update");
        setWalkthroughId(item.id);
        setProjectId(String(item.projectId));
        setProjectListOptions(
            projectList.filter((project) => projectWithWalkthrough.includes(project.id))
        );
        setIsDisabled(true);
        setWalkthroughDesc("");
        setShowLoading(true);

        try {
            const response = await axios.get(`${apiUrl}project-walkthrough/get/${item.id}`);
            setWalkthroughDesc(response.data?.walkthroughDesc || "");
        } catch (error) {
            if (error?.response?.status === 404) {
                try {
                    const fallbackResponse = await axios.get(`${apiUrl}project-walkthrough/get`);
                    const fullItem = (fallbackResponse.data || []).find(
                        (walkthrough) => walkthrough.id === item.id
                    );
                    setWalkthroughDesc(fullItem?.walkthroughDesc || "");
                    return;
                } catch (fallbackError) {
                    const message =
                        fallbackError?.response?.data?.message ||
                        fallbackError?.message ||
                        "Failed to load walkthrough details.";
                    toast.error(message);
                    setShowModal(false);
                    return;
                }
            }
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to load walkthrough details.";
            toast.error(message);
            setShowModal(false);
        } finally {
            setShowLoading(false);
        }
    };

    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        { field: "projectName", headerName: "Project Name", flex: 1 },
        { field: "walkthroughDesc", headerName: "Walkthrough Description", flex: 1 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="d-inline-flex align-items-center">
                    <span
                        className="d-inline-flex mx-2"
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
        <div className="container-fluid">
            <DashboardHeader buttonName={'+ Add Walkthrough'} functionName={openAddModal} heading={'Manage Project Walkthrough'} />
            <div>
                <DataTable columns={columns} list={list} />
            </div>
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
                            {showLoading && walkthroughId > 0 && !walkthroughDesc ? (
                                <div className="py-4 text-center text-muted">Loading walkthrough...</div>
                            ) : (
                                <JoditEditor
                                    ref={editor}
                                    value={walkthroughDesc}
                                    onChange={(newcontent) => setWalkthroughDesc(newcontent)}
                                />
                            )}
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
