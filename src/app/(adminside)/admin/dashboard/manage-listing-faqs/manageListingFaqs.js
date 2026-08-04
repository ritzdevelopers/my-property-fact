"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import { ADMIN_PERMISSIONS } from "../../adminPermissions";

function emptyBulkRow() {
  return {
    pageSlug: "",
    pageTitle: "",
    question: "",
    answer: "",
    sortOrder: 0,
  };
}

export default function ManageListingFaqs({ list, pageOptions = [] }) {
  const router = useRouter();
  const { hasPermission } = useAdminRole();
  const canBulkAdd = hasPermission(ADMIN_PERMISSIONS.BULK_LISTING_FAQS);

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

  const [showBulk, setShowBulk] = useState(false);
  const [bulkRows, setBulkRows] = useState([emptyBulkRow()]);
  const [bulkValidated, setBulkValidated] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const resolvePageTitle = (slug) => {
    const match = pageOptions.find((opt) => opt.pageSlug === slug);
    return match?.pageTitle || "";
  };

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

  const openBulkModel = () => {
    loadPageOptions();
    setBulkRows([emptyBulkRow(), emptyBulkRow()]);
    setBulkValidated(false);
    setShowBulk(true);
  };

  const updateBulkRow = (index, patch) => {
    setBulkRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const handleBulkPageSlugChange = (index, value) => {
    const match = pageOptions.find((opt) => opt.pageSlug === value);
    updateBulkRow(index, {
      pageSlug: value,
      pageTitle: match?.pageTitle || resolvePageTitle(value) || "",
    });
  };

  const addBulkRow = () => {
    setBulkRows((prev) => [...prev, emptyBulkRow()]);
  };

  const removeBulkRow = (index) => {
    setBulkRows((prev) => {
      if (prev.length <= 1) return [emptyBulkRow()];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkValidated(true);

    const faqs = bulkRows
      .map((row) => ({
        pageSlug: String(row.pageSlug || "").trim().toLowerCase(),
        pageTitle: String(row.pageTitle || "").trim(),
        question: String(row.question || "").trim(),
        answer: String(row.answer || "").trim(),
        sortOrder: Number(row.sortOrder) || 0,
      }))
      .filter((row) => row.pageSlug && row.question && row.answer)
      .map((row) => ({
        ...row,
        pageTitle: row.pageTitle || resolvePageTitle(row.pageSlug) || row.pageSlug,
      }));

    if (faqs.length === 0) {
      toast.error(
        "Add at least one complete FAQ (page, question, and answer required)",
      );
      return;
    }

    try {
      setBulkLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}listing-page-faqs/bulk-add`,
        { faqs },
        {
          withCredentials: true,
          headers: mutationHeaders(),
        },
      );
      if (response.data.isSuccess === 1) {
        toast.success(response.data.message);
        setShowBulk(false);
        setBulkRows([emptyBulkRow()]);
        router.refresh();
      } else {
        toast.error(response?.data?.message || "Failed to bulk add FAQs");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "You may not have access to bulk FAQ add",
      );
    } finally {
      setBulkLoading(false);
    }
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
        exportExcel={canBulkAdd ? "+ Bulk Add FAQs" : undefined}
        exportFunction={canBulkAdd ? openBulkModel : undefined}
        exportIconType="add"
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
                placeholder="e.g. 3-bhk-in-noida, food-court-in-gurugram"
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
        size="xl"
        show={showBulk}
        onHide={() => !bulkLoading && setShowBulk(false)}
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Add FAQs (Pro)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Add multiple FAQs for different listing pages in one save. Each row
            can target a different page.
          </p>
          <Form noValidate onSubmit={handleBulkSubmit}>
            {bulkRows.map((row, index) => {
              const incomplete =
                bulkValidated &&
                !(
                  String(row.pageSlug || "").trim() &&
                  String(row.question || "").trim() &&
                  String(row.answer || "").trim()
                );
              return (
                <div
                  key={index}
                  className="border rounded p-3 mb-3"
                  style={{
                    background: incomplete ? "rgba(220,53,69,0.04)" : undefined,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="small">FAQ #{index + 1}</strong>
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeBulkRow(index)}
                      disabled={bulkRows.length <= 1}
                      title="Remove row"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Page</Form.Label>
                    <Form.Select
                      value={row.pageSlug}
                      onChange={(e) =>
                        handleBulkPageSlugChange(index, e.target.value)
                      }
                      isInvalid={
                        bulkValidated && !String(row.pageSlug || "").trim()
                      }
                    >
                      <option value="">Select Page</option>
                      {slugOptions.map((item) => (
                        <option key={item.pageSlug} value={item.pageSlug}>
                          {item.pageTitle}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Or enter page slug</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 3-bhk-in-noida"
                      value={row.pageSlug}
                      onChange={(e) =>
                        handleBulkPageSlugChange(index, e.target.value)
                      }
                      isInvalid={
                        bulkValidated && !String(row.pageSlug || "").trim()
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Sort Order</Form.Label>
                    <Form.Control
                      type="number"
                      min={0}
                      value={row.sortOrder}
                      onChange={(e) =>
                        updateBulkRow(index, { sortOrder: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter Question"
                      value={row.question}
                      onChange={(e) =>
                        updateBulkRow(index, { question: e.target.value })
                      }
                      isInvalid={
                        bulkValidated && !String(row.question || "").trim()
                      }
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Answer</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter Answer"
                      value={row.answer}
                      onChange={(e) =>
                        updateBulkRow(index, { answer: e.target.value })
                      }
                      isInvalid={
                        bulkValidated && !String(row.answer || "").trim()
                      }
                    />
                  </Form.Group>
                </div>
              );
            })}
            <div className="d-flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={addBulkRow}
                disabled={bulkLoading}
              >
                + Add another FAQ
              </Button>
              <Button type="submit" className="btn btn-success" disabled={bulkLoading}>
                Save {bulkRows.length} FAQ
                {bulkRows.length === 1 ? "" : "s"}{" "}
                <LoadingSpinner show={bulkLoading} />
              </Button>
            </div>
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
