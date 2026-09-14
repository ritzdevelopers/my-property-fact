"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useRouter } from "next/navigation";
import {
  LISTING_CONTENT_CATEGORIES,
  getListingPageCategory,
  getListingPageCategoryLabel,
} from "@/lib/listingPageSlugOptions";

const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
});

function emptyForm() {
  return {
    id: 0,
    pageSlug: "",
    pageTitle: "",
    heading: "",
    intro: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  };
}

function hasSavedBody(row) {
  return Boolean(
    String(row?.content || "").replace(/<[^>]*>/g, "").trim() ||
      String(row?.intro || "").trim() ||
      String(row?.heading || "").trim() ||
      String(row?.metaTitle || "").trim() ||
      String(row?.metaDescription || "").trim() ||
      String(row?.metaKeywords || "").trim(),
  );
}

export default function ManageListingContent({
  savedRows = [],
  pageOptions = [],
}) {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [showLoading, setShowLoading] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const savedBySlug = useMemo(() => {
    const map = new Map();
    (savedRows || []).forEach((row) => {
      if (row?.pageSlug) map.set(row.pageSlug, row);
    });
    return map;
  }, [savedRows]);

  const list = useMemo(() => {
    const rows = (pageOptions || []).map((option, index) => {
      const saved = savedBySlug.get(option.pageSlug);
      return {
        id: option.pageSlug,
        index: index + 1,
        pageSlug: option.pageSlug,
        pageTitle: saved?.pageTitle || option.pageTitle,
        category: getListingPageCategory(option.pageSlug),
        categoryLabel: getListingPageCategoryLabel(option.pageSlug),
        heading: saved?.heading || "",
        intro: saved?.intro || "",
        content: saved?.content || "",
        metaTitle: saved?.metaTitle || "",
        metaDescription: saved?.metaDescription || "",
        metaKeywords: saved?.metaKeywords || "",
        recordId: saved?.id || 0,
        hasContent: hasSavedBody(saved),
      };
    });

    const known = new Set(rows.map((row) => row.pageSlug));
    (savedRows || []).forEach((saved) => {
      if (!saved?.pageSlug || known.has(saved.pageSlug)) return;
      rows.push({
        id: saved.pageSlug,
        index: rows.length + 1,
        pageSlug: saved.pageSlug,
        pageTitle: saved.pageTitle || saved.pageSlug,
        category: getListingPageCategory(saved.pageSlug),
        categoryLabel: getListingPageCategoryLabel(saved.pageSlug),
        heading: saved.heading || "",
        intro: saved.intro || "",
        content: saved.content || "",
        metaTitle: saved.metaTitle || "",
        metaDescription: saved.metaDescription || "",
        metaKeywords: saved.metaKeywords || "",
        recordId: saved.id || 0,
        hasContent: hasSavedBody(saved),
      });
    });

    const filtered =
      category === "all"
        ? rows
        : rows.filter((row) => row.category === category);

    return filtered.map((row, index) => ({ ...row, index: index + 1 }));
  }, [pageOptions, savedBySlug, savedRows, category]);

  const mutationHeaders = () => ({
    "Content-Type": "application/json",
  });

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handlePageSlugChange = (value) => {
    const match = pageOptions.find((opt) => opt.pageSlug === value);
    const saved = savedBySlug.get(value);
    patchForm({
      pageSlug: value,
      pageTitle: saved?.pageTitle || match?.pageTitle || "",
      heading: saved?.heading || "",
      intro: saved?.intro || "",
      content: saved?.content || "",
      metaTitle: saved?.metaTitle || "",
      metaDescription: saved?.metaDescription || "",
      metaKeywords: saved?.metaKeywords || "",
      id: saved?.id || 0,
    });
  };

  const openAddModel = () => {
    setValidated(false);
    setForm(emptyForm());
    setShow(true);
  };

  const openEditModel = (row) => {
    setValidated(false);
    setForm({
      id: row.recordId || 0,
      pageSlug: row.pageSlug || "",
      pageTitle: row.pageTitle || "",
      heading: row.heading || "",
      intro: row.intro || "",
      content: row.content || "",
      metaTitle: row.metaTitle || "",
      metaDescription: row.metaDescription || "",
      metaKeywords: row.metaKeywords || "",
    });
    setShow(true);
  };

  const publicPageHref = (slug) => {
    const value = String(slug || "").trim();
    if (!value) return "";
    if (value.startsWith("projects/")) return `/${value}`;
    return value.includes("-in-") ? `/${value}` : `/city/${value}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const current = e.currentTarget;
    const normalizedSlug = form.pageSlug.trim().toLowerCase();

    if (current.checkValidity() === false || !normalizedSlug) {
      e.stopPropagation();
      setValidated(true);
      if (!normalizedSlug) toast.error("Please select a listing page");
      return;
    }

    const data = {
      pageSlug: normalizedSlug,
      pageTitle: form.pageTitle.trim() || normalizedSlug,
      heading: form.heading.trim(),
      intro: form.intro.trim(),
      content: form.content,
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      metaKeywords: form.metaKeywords.trim(),
      isActive: true,
    };
    if (form.id > 0) data.id = Number(form.id);

    try {
      setShowLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/add-update`,
        data,
        {
          withCredentials: true,
          headers: mutationHeaders(),
        },
      );
      if (response.data.isSuccess === 1) {
        toast.success(response.data.message);
        setShow(false);
        router.refresh();
      } else {
        toast.error(response?.data?.message || "Failed to save content");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error occurred");
    } finally {
      setShowLoading(false);
    }
  };

  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 80,
      cellClassName: "centered-cell",
    },
    { field: "pageTitle", headerName: "Page", flex: 1.3 },
    { field: "pageSlug", headerName: "Slug", flex: 1.1 },
    {
      field: "categoryLabel",
      headerName: "Type",
      flex: 0.8,
    },
    {
      field: "hasContent",
      headerName: "Editor",
      width: 120,
      renderCell: (params) => (
        <span
          className={
            params.row.hasContent
              ? "listing-content-status listing-content-status--ready"
              : "listing-content-status"
          }
        >
          {params.row.hasContent ? "Added" : "Empty"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <div className="d-flex align-items-center gap-3">
          <span
            role="button"
            tabIndex={0}
            title="Edit page content"
            onClick={() => openEditModel(params.row)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openEditModel(params.row);
              }
            }}
          >
            <AdminTableEditIcon />
          </span>
          {params.row.recordId > 0 ? (
            <span
              role="button"
              tabIndex={0}
              title="Delete saved content"
              onClick={() => {
                setDeleteId(params.row.recordId);
                setShowConfirmationBox(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setDeleteId(params.row.recordId);
                  setShowConfirmationBox(true);
                }
              }}
            >
              <AdminTableDeleteIcon />
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add page content"}
        functionName={openAddModel}
        heading={"Manage Listing Page Content"}
      />

      <div className="listing-content-filters">
        {LISTING_CONTENT_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              category === item.id
                ? "listing-content-filter is-active"
                : "listing-content-filter"
            }
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <DataTable columns={columns} list={list} />
      </div>

      <Modal
        size="xl"
        show={show}
        onHide={() => !showLoading && setShow(false)}
        centered
        scrollable
        backdrop="static"
        className="mpf-modal"
        dialogClassName="mpf-modal__dialog mpf-modal__dialog--xl"
      >
        <Modal.Header closeButton={!showLoading}>
          <Modal.Title>
            {form.id > 0 ? "Edit listing page content" : "Add listing page content"}
            <small>
              SEO team can write page copy, heading, and meta tags for this URL
            </small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            id="listing-content-form"
            noValidate
            validated={validated}
            onSubmit={handleSubmit}
          >
            <div className="mpf-modal__section">
              <p className="mpf-modal__section-title">Page target</p>
              <div className="mpf-modal__grid mpf-modal__grid--2">
                <Form.Group controlId="listingContentPage">
                  <Form.Label>Select page</Form.Label>
                  <Form.Select
                    value={form.pageSlug}
                    onChange={(e) => handlePageSlugChange(e.target.value)}
                    required
                  >
                    <option value="">Choose a listing page…</option>
                    {pageOptions.map((item) => (
                      <option key={item.pageSlug} value={item.pageSlug}>
                        {item.pageTitle}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Page is required
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="listingContentSlug">
                  <Form.Label>Page slug</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. commercial-property-in-delhi"
                    value={form.pageSlug}
                    onChange={(e) => handlePageSlugChange(e.target.value)}
                    required
                  />
                  <Form.Text>
                    URL path without a leading slash — e.g.{" "}
                    <code>new-projects-in-noida</code>
                    {form.pageSlug ? (
                      <>
                        {" "}
                        ·{" "}
                        <a
                          href={publicPageHref(form.pageSlug)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open public page
                        </a>
                      </>
                    ) : null}
                  </Form.Text>
                </Form.Group>
              </div>
            </div>

            <div className="mpf-modal__section">
              <p className="mpf-modal__section-title">On-page content</p>
              <Form.Group controlId="listingContentHeading" className="mb-3">
                <Form.Label>Page heading (H1)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Optional. Leave blank to keep the default heading."
                  value={form.heading}
                  onChange={(e) => patchForm({ heading: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="listingContentIntro" className="mb-3">
                <Form.Label>Short intro</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Optional line shown under the page heading"
                  value={form.intro}
                  onChange={(e) => patchForm({ intro: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="listingContentEditor">
                <Form.Label>Page editor</Form.Label>
                <Editor
                  value={form.content}
                  onChange={(value) => patchForm({ content: value })}
                />
                <Form.Text>
                  This article appears on the public listing page below the
                  project cards.
                </Form.Text>
              </Form.Group>
            </div>

            <div className="mpf-modal__section">
              <p className="mpf-modal__section-title">SEO meta</p>
              <Form.Group controlId="listingMetaTitle" className="mb-3">
                <Form.Label>Meta title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Browser / Google title"
                  value={form.metaTitle}
                  onChange={(e) => patchForm({ metaTitle: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="listingMetaDescription" className="mb-3">
                <Form.Label>Meta description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Search result description"
                  value={form.metaDescription}
                  onChange={(e) =>
                    patchForm({ metaDescription: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="listingMetaKeywords">
                <Form.Label>Meta keywords</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Comma-separated keywords"
                  value={form.metaKeywords}
                  onChange={(e) => patchForm({ metaKeywords: e.target.value })}
                />
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
            form="listing-content-form"
            className="btn btn-success mpf-modal__btn-primary"
            disabled={showLoading}
          >
            Save content <LoadingSpinner show={showLoading} />
          </Button>
        </Modal.Footer>
      </Modal>

      <CommonModal
        confirmBox={showConfirmationBox}
        setConfirmBox={setShowConfirmationBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/delete/${deleteId}`}
      />
    </>
  );
}
