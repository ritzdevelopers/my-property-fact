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
  const [showKeepSelectionModal, setShowKeepSelectionModal] = useState(false);
  const [pendingPageChange, setPendingPageChange] = useState(null);

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

  const getFirstFaqForPage = (slug) => {
    if (!slug) return null;
    const page = (list || []).find((item) => item.pageSlug === slug);
    return page?.faqs?.[0] || null;
  };

  const resolveBulkPageTitle = (value) =>
    pageOptions.find((opt) => opt.pageSlug === value)?.pageTitle ||
    resolvePageTitle(value) ||
    "";

  /** Yes: same page on every FAQ row. */
  const applyPageToAllBulkRows = (pageSlug, pageTitle) => {
    setBulkRows((prev) =>
      prev.map((row) => ({
        ...row,
        pageSlug,
        pageTitle,
      })),
    );
  };

  /** No: only this FAQ row + load that page's first FAQ. */
  const applyPageToSingleBulkRow = (index, pageSlug, pageTitle) => {
    const firstFaq = getFirstFaqForPage(pageSlug);
    updateBulkRow(index, {
      pageSlug,
      pageTitle,
      question: firstFaq?.question ?? "",
      answer: firstFaq?.answer ?? "",
      sortOrder: firstFaq?.sortOrder ?? 0,
    });
  };

  const handleBulkPageSlugChange = (index, value, { fromSelect = false } = {}) => {
    const pageTitle = resolveBulkPageTitle(value);

    if (!fromSelect || !value) {
      // Manual slug typing: only update this row's page fields.
      updateBulkRow(index, { pageSlug: value, pageTitle });
      return;
    }

    const currentRow = bulkRows[index] || emptyBulkRow();
    const currentSlug = String(currentRow.pageSlug || "");
    if (currentSlug === value) return;

    // Show the chosen page on this row immediately (controlled select).
    updateBulkRow(index, { pageSlug: value, pageTitle });

    setPendingPageChange({
      index,
      pageSlug: value,
      pageTitle,
      previousPageSlug: currentSlug,
      previousPageTitle: currentRow.pageTitle || "",
      previousQuestion: currentRow.question || "",
      previousAnswer: currentRow.answer || "",
      previousSortOrder: currentRow.sortOrder ?? 0,
    });
    setShowKeepSelectionModal(true);
  };

  const confirmKeepCurrentSelection = () => {
    if (!pendingPageChange) return;
    // Yes → same page selected on FAQ #1, #2, and all other rows.
    applyPageToAllBulkRows(
      pendingPageChange.pageSlug,
      pendingPageChange.pageTitle,
    );
    setShowKeepSelectionModal(false);
    setPendingPageChange(null);
  };

  const confirmUseFirstFaq = () => {
    if (!pendingPageChange) return;
    // No → only this single row; load first FAQ for the selected page.
    applyPageToSingleBulkRow(
      pendingPageChange.index,
      pendingPageChange.pageSlug,
      pendingPageChange.pageTitle,
    );
    setShowKeepSelectionModal(false);
    setPendingPageChange(null);
  };

  const cancelPendingPageChange = () => {
    if (pendingPageChange) {
      updateBulkRow(pendingPageChange.index, {
        pageSlug: pendingPageChange.previousPageSlug,
        pageTitle: pendingPageChange.previousPageTitle,
        question: pendingPageChange.previousQuestion,
        answer: pendingPageChange.previousAnswer,
        sortOrder: pendingPageChange.previousSortOrder,
      });
    }
    setShowKeepSelectionModal(false);
    setPendingPageChange(null);
  };

  const addBulkRow = () => {
    setBulkRows((prev) => {
      const source = prev.find((row) => String(row.pageSlug || "").trim());
      const next = emptyBulkRow();
      if (source) {
        next.pageSlug = source.pageSlug;
        next.pageTitle = source.pageTitle;
      }
      return [...prev, next];
    });
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
        exportExcel={canBulkAdd ? "Bulk Add FAQs" : undefined}
        exportFunction={canBulkAdd ? openBulkModel : undefined}
        exportIconType="add"
      />
      <div className="table-container">
        <DataTable columns={columns} list={list} />
      </div>

      <Modal
        size="lg"
        show={show}
        onHide={() => !showLoading && setShow(false)}
        centered
        backdrop="static"
        className="mpf-modal"
        dialogClassName="mpf-modal__dialog"
      >
        <Modal.Header closeButton={!showLoading}>
          <Modal.Title>
            {title}
            <small>
              {faqId > 0
                ? "Update this FAQ for the selected listing page"
                : "Attach a question & answer to a listing page"}
            </small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            id="listing-faq-form"
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
          >
            <div className="mpf-modal__section">
              <p className="mpf-modal__section-title">Page target</p>
              <div className="mpf-modal__grid mpf-modal__grid--2">
                <Form.Group controlId="selectPage">
                  <Form.Label>Select page</Form.Label>
                  <Form.Select
                    aria-label="Select listing page"
                    onChange={(e) => handlePageSlugChange(e.target.value)}
                    value={pageSlug}
                    required
                    disabled={faqId > 0}
                  >
                    <option value="">
                      {slugOptions.length
                        ? "Choose a listing page…"
                        : "No pages loaded — enter slug"}
                    </option>
                    {slugOptions.map((item) => (
                      <option key={item.pageSlug} value={item.pageSlug}>
                        {item.pageTitle}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Page is required
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="sortOrder">
                  <Form.Label>Sort order</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                  <Form.Text>Lower numbers appear first</Form.Text>
                </Form.Group>
              </div>

              <Form.Group controlId="customPageSlug" className="mt-3">
                <Form.Label>Or enter page slug</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 3-bhk-in-noida"
                  value={pageSlug}
                  onChange={(e) => handlePageSlugChange(e.target.value)}
                  disabled={faqId > 0}
                />
                <Form.Text>
                  URL path without a leading slash — e.g. <code>new-projects-in-noida</code>
                </Form.Text>
              </Form.Group>
            </div>

            <div className="mpf-modal__section">
              <p className="mpf-modal__section-title">FAQ content</p>
              <Form.Group controlId="question" className="mb-3">
                <Form.Label>Question</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="What buyers usually ask…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Question is required
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group controlId="answer">
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={answer}
                  placeholder="Clear, helpful answer…"
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Answer is required
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            className="mpf-modal__btn-cancel"
            onClick={() => setShow(false)}
            disabled={showLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="listing-faq-form"
            className="btn btn-success mpf-modal__btn-primary"
            disabled={showLoading}
          >
            {buttonName || "Save FAQ"} <LoadingSpinner show={showLoading} />
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="xl"
        show={showBulk}
        onHide={() => !bulkLoading && setShowBulk(false)}
        centered
        scrollable
        backdrop="static"
        className="mpf-modal"
        dialogClassName="mpf-modal__dialog mpf-modal__dialog--xl"
      >
        <Modal.Header closeButton={!bulkLoading}>
          <Modal.Title>
            Bulk add FAQs
            <small>Add several FAQs at once — each row can target a different page</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="listing-faq-bulk-form" noValidate onSubmit={handleBulkSubmit}>
            <div className="mpf-modal__hint">
              Tip: pick a page on FAQ #1 and we&apos;ll ask if you want the same page on every row.
            </div>
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
                  className={`mpf-modal__card${incomplete ? " mpf-modal__card--invalid" : ""}`}
                >
                  <div className="mpf-modal__card-head">
                    <span className="mpf-modal__card-badge">FAQ #{index + 1}</span>
                    <Button
                      type="button"
                      variant="outline-danger"
                      size="sm"
                      className="mpf-modal__card-remove"
                      onClick={() => removeBulkRow(index)}
                      disabled={bulkRows.length <= 1 || bulkLoading}
                      title="Remove row"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Remove</span>
                    </Button>
                  </div>
                  <div className="mpf-modal__grid mpf-modal__grid--2">
                    <Form.Group>
                      <Form.Label>Page</Form.Label>
                      <Form.Select
                        value={row.pageSlug}
                        onChange={(e) =>
                          handleBulkPageSlugChange(index, e.target.value, {
                            fromSelect: true,
                          })
                        }
                        isInvalid={
                          bulkValidated && !String(row.pageSlug || "").trim()
                        }
                      >
                        <option value="">Choose a listing page…</option>
                        {slugOptions.map((item) => (
                          <option key={item.pageSlug} value={item.pageSlug}>
                            {item.pageTitle}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Sort order</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        value={row.sortOrder}
                        onChange={(e) =>
                          updateBulkRow(index, { sortOrder: e.target.value })
                        }
                      />
                    </Form.Group>
                  </div>
                  <Form.Group className="mt-3">
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
                  <Form.Group className="mt-3">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="What buyers usually ask…"
                      value={row.question}
                      onChange={(e) =>
                        updateBulkRow(index, { question: e.target.value })
                      }
                      isInvalid={
                        bulkValidated && !String(row.question || "").trim()
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mt-3">
                    <Form.Label>Answer</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Clear, helpful answer…"
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
          </Form>
        </Modal.Body>
        <Modal.Footer className="mpf-modal__footer-split">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={addBulkRow}
            disabled={bulkLoading}
          >
            + Add another FAQ
          </Button>
          <div className="mpf-modal__footer-actions">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => setShowBulk(false)}
              disabled={bulkLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="listing-faq-bulk-form"
              className="btn btn-success"
              disabled={bulkLoading}
            >
              Save {bulkRows.length} FAQ
              {bulkRows.length === 1 ? "" : "s"}{" "}
              <LoadingSpinner show={bulkLoading} />
            </Button>
          </div>
        </Modal.Footer>
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
        className="mpf-modal"
        dialogClassName="mpf-modal__dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            FAQs — {pageTitle || pageSlug}
            <small>{faqList.length} question{faqList.length === 1 ? "" : "s"} on this page</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="admin-faq-list">
            {faqList.length === 0 ? (
              <div className="mpf-modal__empty">No FAQs on this page yet.</div>
            ) : (
              faqList.map((item, index) => (
                <div className="admin-faq-card" key={item.id ?? index}>
                  <div className="admin-faq-card__header">
                    <p className="admin-faq-card__question">
                      {`Q${index + 1}. ${item.question}`}
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
                    <span className="admin-faq-card__answer-label">A — </span>
                    {item.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              setShowFaqList(false);
              setPageSlug("");
              setPageTitle("");
            }}
          >
            Close
          </Button>
          <Button type="button" className="btn btn-success" onClick={openAddModel}>
            + Add FAQ
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showKeepSelectionModal}
        onHide={cancelPendingPageChange}
        centered
        backdrop="static"
        className="mpf-modal"
        dialogClassName="mpf-modal__dialog mpf-modal__dialog--sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Apply page to all FAQs?
            <small>Choose how this page selection should apply</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mpf-modal__confirm">
            <p>
              You selected{" "}
              <strong>
                {pendingPageChange?.pageTitle ||
                  pendingPageChange?.pageSlug ||
                  "this page"}
              </strong>
              .
            </p>
            <ul>
              <li>
                <strong>Yes</strong> — use this page on FAQ #2 and every other row
              </li>
              <li>
                <strong>No</strong> — apply only to this FAQ and load that page&apos;s first FAQ
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={cancelPendingPageChange}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={confirmUseFirstFaq}>
            No — only this FAQ
          </Button>
          <Button variant="success" onClick={confirmKeepCurrentSelection}>
            Yes — same page on all
          </Button>
        </Modal.Footer>
      </Modal>

      <CommonModal
        confirmBox={showConfirmationBox}
        setConfirmBox={setShowConfirmationBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}listing-page-faqs/delete/${faqId}`}
      />
    </>
  );
}
