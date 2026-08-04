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

export default function ManageListingFaqs({ list, pageOptions = [] }) {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(false);
  const [pageSlug, setPageSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [faqId, setFaqId] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [showFaqList, setShowFaqList] = useState(false);
  const [faqList, setFaqList] = useState([]);
  const [slugOptions, setSlugOptions] = useState(pageOptions);

  const mutationHeaders = () => {
    const token =
      typeof window !== "undefined" ? Cookies.get("token") : undefined;
    return {
      "Content-Type": "application/json",
    };
  };

  const loadPageOptions = () => {
    setSlugOptions(Array.isArray(pageOptions) ? pageOptions : []);
  };

  useEffect(() => {
    loadPageOptions();
  }, [pageOptions]);

  const handlePageSlugChange = (value) => {
    setPageSlug(value);
    const match = pageOptions.find((opt) => opt.pageSlug === value);
    if (match) {
      setPageTitle(match.pageTitle);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const normalizedQuestion = question.trim();
    const normalizedAnswer = answer.trim();
    const normalizedSlug = pageSlug.trim().toLowerCase();

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (!normalizedSlug) {
      toast.error("Please select or enter a valid page slug");
      setValidated(true);
      return;
    }
    if (!normalizedQuestion || !normalizedAnswer) {
      toast.error("Question and answer are required");
      setValidated(true);
      return;
    }

    const data = {
      pageSlug: normalizedSlug,
      pageTitle: pageTitle.trim() || normalizedSlug,
      question: normalizedQuestion,
      answer: normalizedAnswer,
      sortOrder: Number(sortOrder) || 0,
    };
    if (faqId > 0) {
      data.id = Number(faqId);
    }

    try {
      setShowLoading(true);
      setButtonName("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}listing-page-faqs/add-update`,
        data,
        {
          withCredentials: true,
          headers: mutationHeaders(),
        },
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
      toast.error(error?.response?.data?.message || "Error Occurred");
    } finally {
      setShowLoading(false);
      setButtonName(faqId > 0 ? "Update" : "Add FAQ");
    }
  };

  const openAddModel = () => {
    setValidated(false);
    setShow(true);
    setTitle("Add Listing Page FAQ");
    setButtonName("Add FAQ");
    setAnswer("");
    setQuestion("");
    setSortOrder(0);
    if (!showFaqList) {
      setPageSlug("");
      setPageTitle("");
    }
    loadPageOptions();
    setFaqId(0);
  };

  const openEditModel = (item) => {
    setShow(true);
    setTitle("Update FAQ");
    setButtonName("Update");
    setAnswer(item.answer);
    setQuestion(item.question);
    setSortOrder(item.sortOrder ?? 0);
    setFaqId(item.id);
    setPageSlug(item.pageSlug || pageSlug || "");
    setPageTitle(item.pageTitle || pageTitle || "");
    loadPageOptions();
  };

  const openConfirmationBox = (id) => {
    setFaqId(id);
    setShowConfirmationBox(true);
  };

  const openFaqList = (data) => {
    setShowFaqList(true);
    setFaqList(data.faqs || []);
    setPageSlug(data.pageSlug);
    setPageTitle(data.pageTitle || data.pageSlug);
  };

  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 80,
      cellClassName: "centered-cell",
    },
    { field: "pageTitle", headerName: "Page", flex: 1.2 },
    { field: "pageSlug", headerName: "Page Slug", flex: 1 },
    {
      field: "noOfFaqs",
      headerName: "Total FAQs",
      flex: 0.8,
      renderCell: (params) => (
        <div className="d-flex align-items-center">
          <span className="p-0 fs-5">{params.row.noOfFaqs}</span>
          <FontAwesomeIcon
            className="text-warning mx-4 fs-5"
            style={{ cursor: "pointer" }}
            icon={faEye}
            onClick={() => openFaqList(params.row)}
            title="View FAQs list"
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add FAQ"}
        functionName={openAddModel}
        heading={"Manage Listing Page FAQs"}
      />
      <div className="table-container">
        <DataTable columns={columns} list={list} />
      </div>

      <Modal size="lg" show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="selectPage" className="mb-3">
              <Form.Label>Select Page</Form.Label>
              <Form.Select
                aria-label="Select listing page"
                onChange={(e) => handlePageSlugChange(e.target.value)}
                value={pageSlug}
                required
                disabled={faqId > 0}
              >
                <option value="">
                  {slugOptions.length
                    ? "Select Page"
                    : "No pages loaded — enter slug below"}
                </option>
                {slugOptions.map((item) => (
                  <option key={item.pageSlug} value={item.pageSlug}>
                    {item.pageTitle}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Page is required!
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="customPageSlug" className="mb-3">
              <Form.Label>Or enter page slug manually</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. food-court-in-noida"
                value={pageSlug}
                onChange={(e) => handlePageSlugChange(e.target.value)}
                disabled={faqId > 0}
              />
              <Form.Text className="text-muted">
                Use the URL path without leading slash (e.g. new-projects-in-noida)
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="sortOrder" className="mb-3">
              <Form.Label>Sort Order</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="question" className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Question is required!
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="answer" className="mb-3">
              <Form.Label>Answer</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={answer}
                placeholder="Enter Answer"
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Answer is required!
              </Form.Control.Feedback>
            </Form.Group>

            <Button className="mt-3 btn btn-success" type="submit" disabled={showLoading}>
              {buttonName} <LoadingSpinner show={showLoading} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showFaqList}
        onHide={() => {
          setShowFaqList(false);
          setPageSlug("");
          setPageTitle("");
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <DashboardHeader
              buttonName={"+ Add FAQ"}
              functionName={openAddModel}
              heading={`FAQs — ${pageTitle || pageSlug}`}
            />
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
                      onClick={() =>
                        openEditModel({
                          ...item,
                          pageSlug,
                          pageTitle,
                        })
                      }
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
        api={`${process.env.NEXT_PUBLIC_API_URL}listing-page-faqs/delete/${faqId}`}
      />
    </>
  );
}
