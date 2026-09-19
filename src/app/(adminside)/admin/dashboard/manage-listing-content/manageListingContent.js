"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import {
  LISTING_CONTENT_CATEGORIES,
  getListingPageCategory,
  getListingPageCategoryLabel,
} from "@/lib/listingPageSlugOptions";
import { fetchListingPageOptions } from "@/lib/fetchListingPageOptions";

const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
});

const DEFAULT_PAGE_SIZE = 10;

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

function mapContentRows(content, page, pageSize) {
  return (Array.isArray(content) ? content : []).map((item, index) => ({
    id: item.pageSlug,
    index: page * pageSize + index + 1,
    pageSlug: item.pageSlug,
    pageTitle: item.pageTitle || item.pageSlug,
    category: getListingPageCategory(item.pageSlug),
    categoryLabel: getListingPageCategoryLabel(item.pageSlug),
    heading: item.heading || "",
    metaTitle: item.metaTitle || "",
    recordId: item.id || 0,
    hasContent: Boolean(item.hasContent),
  }));
}

function formFromContent(data = {}, fallback = {}) {
  return {
    id: data.id || fallback.id || 0,
    pageSlug: data.pageSlug || fallback.pageSlug || "",
    pageTitle: data.pageTitle || fallback.pageTitle || "",
    heading: data.heading || "",
    intro: data.intro || "",
    content: data.content || "",
    metaTitle: data.metaTitle || "",
    metaDescription: data.metaDescription || "",
    metaKeywords: data.metaKeywords || "",
  };
}

export default function ManageListingContent({ pageOptions = [] }) {
  const [category, setCategory] = useState("all");
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [showLoading, setShowLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [list, setList] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [slugOptions, setSlugOptions] = useState(
    Array.isArray(pageOptions) ? pageOptions : [],
  );

  const mutationHeaders = () => ({
    "Content-Type": "application/json",
  });

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const fetchContents = useCallback(async (page, pageSize, selectedCategory) => {
    setTableLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/get-all`,
        {
          params: {
            page,
            size: pageSize,
            category: selectedCategory || "all",
          },
        },
      );
      const data = response.data ?? {};
      if (Array.isArray(data)) {
        const filtered =
          selectedCategory && selectedCategory !== "all"
            ? data.filter(
                (item) => getListingPageCategory(item.pageSlug) === selectedCategory,
              )
            : data;
        const from = page * pageSize;
        setList(
          mapContentRows(filtered.slice(from, from + pageSize), page, pageSize),
        );
        setRowCount(filtered.length);
        return;
      }
      const rows = mapContentRows(data.content ?? [], page, pageSize);
      setList(rows);
      setRowCount(Number(data.totalElements) || 0);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Could not load listing page content",
      );
      setList([]);
      setRowCount(0);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContents(paginationModel.page, paginationModel.pageSize, category);
  }, [fetchContents, paginationModel.page, paginationModel.pageSize, category]);

  useEffect(() => {
    if (Array.isArray(pageOptions) && pageOptions.length) {
      setSlugOptions(pageOptions);
      return;
    }
    let cancelled = false;
    fetchListingPageOptions().then((options) => {
      if (!cancelled) setSlugOptions(options);
    });
    return () => {
      cancelled = true;
    };
  }, [pageOptions]);

  const loadContentBySlug = async (slug, recordId = 0) => {
    if (recordId > 0) {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/get-by-id/${recordId}`,
      );
      return response.data?.pageSlug ? response.data : null;
    }
    if (!slug) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/get-by-slug`,
      { params: { slug } },
    );
    return response.data?.pageSlug ? response.data : null;
  };

  const handlePageSlugChange = async (value) => {
    const match = slugOptions.find((opt) => opt.pageSlug === value);
    patchForm({
      ...emptyForm(),
      pageSlug: value,
      pageTitle: match?.pageTitle || "",
    });
    if (!value) return;
    try {
      setFormLoading(true);
      const saved = await loadContentBySlug(value);
      if (saved) {
        setForm(formFromContent(saved, { pageTitle: match?.pageTitle || "" }));
      }
    } catch {
      // Keep the selected page even if it has no saved content yet.
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModel = () => {
    setValidated(false);
    setForm(emptyForm());
    setShow(true);
    if (!slugOptions.length) {
      fetchListingPageOptions().then(setSlugOptions);
    }
  };

  const openEditModel = async (row) => {
    setValidated(false);
    setForm({
      ...emptyForm(),
      id: row.recordId || 0,
      pageSlug: row.pageSlug || "",
      pageTitle: row.pageTitle || "",
      heading: row.heading || "",
      metaTitle: row.metaTitle || "",
    });
    setShow(true);
    setFormLoading(true);
    try {
      const saved = await loadContentBySlug(row.pageSlug, row.recordId);
      if (saved) setForm(formFromContent(saved, row));
    } catch {
      toast.error("Could not load this page's content");
    } finally {
      setFormLoading(false);
    }
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
        await fetchContents(
          paginationModel.page,
          paginationModel.pageSize,
          category,
        );
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
            onClick={() => {
              setCategory(item.id);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <DataTable
          columns={columns}
          list={list}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={tableLoading}
        />
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
          {formLoading ? (
            <div className="mpf-modal__empty">Loading page content…</div>
          ) : null}
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
                    disabled={formLoading}
                  >
                    <option value="">
                      {slugOptions.length
                        ? "Choose a listing page…"
                        : "Loading pages…"}
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
                <Form.Group controlId="listingContentSlug">
                  <Form.Label>Page slug</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. commercial-property-in-delhi"
                    value={form.pageSlug}
                    onChange={(e) => {
                      const value = e.target.value;
                      const match = slugOptions.find((opt) => opt.pageSlug === value);
                      patchForm({
                        pageSlug: value,
                        pageTitle: match?.pageTitle || form.pageTitle,
                      });
                    }}
                    onBlur={(e) => handlePageSlugChange(e.target.value)}
                    required
                    disabled={formLoading}
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
            disabled={showLoading || formLoading}
          >
            Save content <LoadingSpinner show={showLoading} />
          </Button>
        </Modal.Footer>
      </Modal>

      <CommonModal
        confirmBox={showConfirmationBox}
        setConfirmBox={setShowConfirmationBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}listing-page-contents/delete/${deleteId}`}
        onSuccess={() =>
          fetchContents(paginationModel.page, paginationModel.pageSize, category)
        }
      />
    </>
  );
}
