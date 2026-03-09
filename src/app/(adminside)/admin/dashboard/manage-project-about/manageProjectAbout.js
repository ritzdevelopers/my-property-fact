"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
// Dynamically import JoditEditor with SSR disabled
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function ManageProjectAbout({ list, projectsList, projectIdsWithAbout }) {
    const editor = useRef(null);
    const [shortDesc, setShortDesc] = useState("");
    const [longDesc, setLongDesc] = useState("");
    const [projectId, setProjectId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [aboutId, setAboutId] = useState(0);
    const [confirmBox, setConfirmBox] = useState(false);
    const [validated, setValidated] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [projectOptionsList, setProjectOptionsList] = useState([]);
    const [isDisable, setIsDisable] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            shortDesc: shortDesc,
            longDesc: longDesc,
            projectId: projectId,
        };
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if (form.checkValidity() === true) {
            setShowLoading(true);
            try {
                if (aboutId > 0) {
                    data.id = aboutId;
                }
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}project-about/add-update`,
                    data
                );
                if (response.data.isSuccess === 1) {
                    toast.success(response.data.message);
                    setShowModal(false);
                    fetchProjectsAbout();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error(error);
            } finally {
                setShowLoading(false);
            }
        }
    };

    const openAddModel = () => {
        setShowModal(true);
        setTitle("Add Project About");
        setProjectId(0);
        setShortDesc("");
        setLongDesc("");
        setAboutId(0);
        setValidated(false);
        setIsDisable(false);
        setProjectOptionsList(projectsList.filter((project) => !projectIdsWithAbout.includes(project.id)));
    };
    const openEditModel = (item) => {
        setShowModal(true);
        setTitle("Edit Project About");
        setProjectId(item.projectId);
        setShortDesc(item.shortDesc);
        setLongDesc(item.longDesc);
        setAboutId(item.id);
        setIsDisable(true);
        setProjectOptionsList(projectsList.filter((project) => projectIdsWithAbout.includes(project.id)));
    };

    const openConfirmationBox = (id) => {
        setAboutId(id);
        setConfirmBox(true);
    };

    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "projectName", headerName: "Project Name", flex: 1 },
        { field: "shortDesc", headerName: "Short Description", flex: 1 },
        { field: "longDesc", headerName: "Long Description", flex: 1 },
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="gap-3">
                    <FontAwesomeIcon
                        className="text-danger mx-2"
                        style={{ cursor: "pointer" }}
                        icon={faTrash}
                        onClick={() => openConfirmationBox(params.row.id)}
                    />
                    <FontAwesomeIcon
                        className="text-warning pointer mx-2"
                        style={{ cursor: "pointer" }}
                        icon={faPencil}
                        onClick={() => openEditModel(params.row)}
                    />
                </div>
            ),
        },
    ];
    return (
        <div className="container-fluid">
            <DashboardHeader buttonName={"+ Add"} functionName={openAddModel} heading={"Manage Project About"} />
            <div className="table-container">
                <DataTable columns={columns} list={list} />
            </div>
            {/* Modal for adding a new city */}
            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group md="4" controlId="validationCustom01">
                            <Form.Label>Select Project</Form.Label>
                            <Form.Select
                                aria-label="Default select example"
                                onChange={(e) => setProjectId(e.target.value)}
                                value={projectId}
                                required
                                disabled= {isDisable}
                            >
                                <option value="">Select Project</option>
                                {projectOptionsList.map((item) => (
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
                        <Form.Group className="mb-3" controlId="formCityName">
                            <Form.Label>Write short description</Form.Label>
                            <JoditEditor
                                ref={editor}
                                value={shortDesc}
                                onChange={(newcontent) => setShortDesc(newcontent)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCityName">
                            <Form.Label>Write long description</Form.Label>
                            <JoditEditor
                                ref={editor}
                                value={longDesc}
                                onChange={(newcontent) => setLongDesc(newcontent)}
                            />
                        </Form.Group>
                        <Button className="btn btn-success" type="submit" disabled={showLoading}>
                            Submit <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <CommonModal api={`${process.env.NEXT_PUBLIC_API_URL}project-about/delete/${aboutId}`} confirmBox={confirmBox} setConfirmBox={setConfirmBox} />
        </div>
    );
}
