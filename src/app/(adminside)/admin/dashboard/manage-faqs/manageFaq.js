"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Cookies from "js-cookie";
import { AdminTableDeleteIcon } from "../common-model/admin-table-icons";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
export default function ManageFaqs({ list, projectsList }) {
    const router = useRouter();

    const [show, setShow] = useState(false);
    const [title, setTitle] = useState("");
    const [buttonName, setButtonName] = useState("");
    const [validated, setValidated] = useState(false);
    const [projectId, setProjectId] = useState(0);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [faqId, setFaqId] = useState(0);
    const [showLoading, setShowLoading] = useState(false);
    const [showConfirmationBox, setShowConfirmationBox] = useState(false);
    const [showFaqList, setShowFaqList] = useState(false);
    const [faqList, setFaqList] = useState([]);
    const [projetOption, setProjectOption] = useState([]);

    const mutationHeaders = () => {
        const token =
            typeof window !== "undefined" ? Cookies.get("token") : undefined;
        return {
            "Content-Type": "application/json",
        };
    };

    //Handling submitting form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const normalizedQuestion = question.trim();
        const normalizedAnswer = answer.trim();
        const normalizedProjectId = Number(projectId);

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if (!normalizedProjectId || Number.isNaN(normalizedProjectId)) {
            toast.error("Please select a valid project");
            setValidated(true);
            return;
        }
        if (!normalizedQuestion || !normalizedAnswer) {
            toast.error("Question and answer are required");
            setValidated(true);
            return;
        }
        if (form.checkValidity() === true) {
            const data = {
                question: normalizedQuestion,
                answer: normalizedAnswer,
                projectId: normalizedProjectId,
            };
            if (faqId > 0) {
                data.id = Number(faqId);
            }
            try {
                setShowLoading(true);
                setButtonName("");
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}project-faqs/add-update`,
                    data,
                    {
                        withCredentials: true,
                        headers: mutationHeaders(),
                    }
                );
                if (response.data.isSuccess === 1) {
                    toast.success(response.data.message);
                    router.refresh();
                    setShow(false);
                    setShowFaqList(false);
                } else {
                    toast.error(response?.data?.message || "Failed to save FAQ");
                }
            } catch (error) {
                toast.error(error?.response?.data?.message || "Error Occured");
            } finally {
                setShowLoading(false);
                setButtonName(faqId > 0 ? "Update" : "Add FAQ");
            }
        }
    };

    const loadProjectOptions = () => {
        setProjectOption(Array.isArray(projectsList) ? projectsList : []);
    };

    //Handle Add FAQ
    const openAddModel = () => {
        setValidated(false);
        setShow(true);
        setTitle("Add FAQ");
        setButtonName("Add FAQ");
        setAnswer("");
        setQuestion("");
        if (!showFaqList) {
            setProjectId(0);
        }
        loadProjectOptions();
        setFaqId(0);
    };
    //Handle edit FAQ
    const openEditModel = (item) => {
        setShow(true);
        setTitle("Update FAQ");
        setButtonName("Update");
        setAnswer(item.answer);
        setQuestion(item.question);
        setFaqId(item.id);
        setProjectId(item.projectId || projectId || 0);
        loadProjectOptions();
    };

    useEffect(() => {
        loadProjectOptions();
    }, [projectsList]);

    //Handle delete faq
    const openConfirmationBox = (id) => {
        setFaqId(id);
        setShowConfirmationBox(true);
    };
    //opening faqs list
    const openFaqList = (data) => {
        setShowFaqList(true);
        setFaqList(data.projectFaq);
        setProjectId(data.projectId);
    }
    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100, cellClassName: "centered-cell" },
        { field: "projectName", headerName: "Project Name", flex: 1 },
        {
            field: "noOfFaqs", headerName: "Total FAQs", flex: 1,
            renderCell: (params) => (
                <div className="d-flex align-items-center">
                    <span className="p-0 fs-5">{params.row.noOfFaqs}</span>
                    <FontAwesomeIcon
                        className="text-warning mx-4 fs-5"
                        style={{ cursor: "pointer" }}
                        icon={faEye}
                        onClick={() => openFaqList(params.row)}
                        title="View faqs list"
                    />
                </div>
            )
        },
    ];
    return (
        <>
            <DashboardHeader buttonName={"+Add FAQ"} functionName={openAddModel} heading={"Manage FAQs"} />
            <div className="table-container">
                <DataTable columns={columns} list={list} />
            </div>
            <Modal size="lg" show={show} onHide={() => setShow(false)} centered>
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
                                disabled={faqId > 0}
                            >
                                <option value="">
                                    {projetOption.length
                                        ? "Select Project"
                                        : "No projects loaded"}
                                </option>
                                {projetOption
                                    .map((item) => (
                                        <option
                                            className="text-uppercase"
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.projectName}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Project is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="question">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="metaDescription"
                                placeholder="Enter Question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Question is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group md="4" controlId="answer">
                            <Form.Label>Answer</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="metaDescription"
                                value={answer}
                                placeholder="Enter Answer"
                                onChange={(e) => setAnswer(e.target.value)}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Answer is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Button className="mt-3 btn btn-success" type="submit" disabled={showLoading}>
                            {buttonName} <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showFaqList} onHide={() => {
                setShowFaqList(false)
                setProjectId(0);
            }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <DashboardHeader buttonName={"+ Add FAQ"} functionName={openAddModel} heading={"FAQs"} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="admin-faq-list">
                        {faqList.map((item, index) => (
                            <div className="admin-faq-card" key={item.id ?? index}>
                                <div className="admin-faq-card__header">
                                    <p className="admin-faq-card__question">
                                        {`Q ${index + 1} - ${item.question}`}
                                    </p>
                                    <div className="admin-faq-card__actions">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => openEditModel(item)}
                                        >
                                            Edit
                                        </Button>
                                        <span
                                            className="d-inline-flex align-items-center"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => openConfirmationBox(item.id)}
                                            role="presentation"
                                        >
                                            <AdminTableDeleteIcon />
                                        </span>
                                    </div>
                                </div>
                                <p className="admin-faq-card__answer">
                                    <span className="admin-faq-card__answer-label">Ans - </span>
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>
            <CommonModal
                confirmBox={showConfirmationBox}
                setConfirmBox={setShowConfirmationBox}
                api={`${process.env.NEXT_PUBLIC_API_URL}project-faqs/delete/${faqId}`}
            />
        </>
    );
}
