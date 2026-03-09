"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { faEye, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { Accordion, Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
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

    //Handling submitting form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if (form.checkValidity() === true) {
            const data = {
                question: question,
                answer: answer,
                projectId: projectId,
            };
            if (faqId > 0) {
                data.id = faqId;
            }
            try {
                setShowLoading(true);
                setButtonName("");
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}project-faqs/add-update`,
                    data
                );
                if (response.data.isSuccess === 1) {
                    toast.success(response.data.message);
                    router.refresh();
                    setShow(false);
                    setShowFaqList(false);
                }
            } catch (error) {
                toast.error("Error Occured");
            } finally {
                setShowLoading(false);
                setButtonName("Add FAQ");
            }
        }
    };

    const projectWithoutFaq = () => {
        const excludedIds = list.map(item => item.projectId);
        let res = [];
        if (projectId === 0) {
            res = projectsList.filter(project => !excludedIds.includes(project.id));
            setProjectOption(res);
        } else {
            setProjectOption(projectsList);
        }
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
        projectWithoutFaq();
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
        projectWithoutFaq();
    };

    useEffect(() => {
        projectWithoutFaq();
    }, []);

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
                                disabled={projectId !== 0 ? true : false}
                            >
                                <option value="">Select Project</option>
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
                    <Accordion defaultActiveKey="0">
                        {faqList.map((item, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <div className="d-flex align-items-center justify-content-between px-3 pt-3">
                                    <Accordion.Header className="flex-grow-1">
                                        {`Q ${index + 1} - ${item.question}`}
                                    </Accordion.Header>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="ms-3"
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent accordion toggle
                                            openEditModel(item);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <FontAwesomeIcon
                                        className="text-danger mx-2"
                                        style={{ cursor: "pointer" }}
                                        icon={faTrash}
                                        onClick={() => openConfirmationBox(item.id)}
                                    />
                                </div>
                                <Accordion.Body>{`Ans - ${item.answer}`}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
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
