"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { fetchListingPageCatalog } from "@/lib/fetchListingPageCatalog";
import { parseListingContentDocument } from "./parseListingContentDocument";

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

export default function ManageListingContent() {
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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [pageSearch, setPageSearch] = useState("");
  const [pageSearchResults, setPageSearchResults] = useState([]);
  const [pageSearchLoading, setPageSearchLoading] = useState(false);
  const [importParsing, setImportParsing] = useState(false);
  const importFileInputRef = useRef(null);

  const mutationHeaders = () => ({
    "Content-Type": "application/json",
  });

  const patchForm = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const fetchContents = useCallback(async (page, pageSize, selectedCategory, query) => {
    setTableLoading(true);
    try {
      const data = await fetchListingPageCatalog({
        kind: "content",
        page,
        pageSize,
        category: selectedCategory || "all",
        q: query || "",
      });
      setList(mapContentRows(data.content, page, pageSize));
      setRowCount(data.totalElements);
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
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setSearchQuery((prev) => {
        if (prev === next) return prev;
        setPaginationModel((model) => ({ ...model, page: 0 }));
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchContents(
      paginationModel.page,
      paginationModel.pageSize,
      category,
      searchQuery,
    );
  }, [
    fetchContents,
    paginationModel.page,
    paginationModel.pageSize,
    category,
    searchQuery,
  ]);

  useEffect(() => {
    if (!show) return undefined;

    const query = pageSearch.trim();
    const timer = setTimeout(async () => {
      setPageSearchLoading(true);
      try {
        const data = await fetchListingPageCatalog({
          kind: "content",
          page: 0,
          pageSize: 20,
          category: "all",
          q: query,
        });
        setPageSearchResults(Array.isArray(data.content) ? data.content : []);
      } catch {
        setPageSearchResults([]);
      } finally {
        setPageSearchLoading(false);
      }
    }, query ? 250 : 0);

    return () => clearTimeout(timer);
  }, [show, pageSearch]);

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

  const selectListingPage = async (option) => {
    const value = String(option?.pageSlug || "").trim();
    const title = String(option?.pageTitle || "").trim();
    if (!value) return;

    setPageSearch(title);
    setPageSearchResults([]);
    patchForm({
      ...emptyForm(),
      pageSlug: value,
      pageTitle: title,
    });

    try {
      setFormLoading(true);
      const saved = await loadContentBySlug(value);
      if (saved) {
        setForm(formFromContent(saved, { pageSlug: value, pageTitle: title }));
      }
    } catch {
      // Keep the selected page even if it has no saved content yet.
    } finally {
      setFormLoading(false);
    }
  };

  const handlePageSlugChange = async (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) return;

    const match = pageSearchResults.find((opt) => opt.pageSlug === normalized);
    await selectListingPage({
      pageSlug: normalized,
      pageTitle: match?.pageTitle || form.pageTitle || normalized,
    });
  };

  const openAddModel = () => {
    setValidated(false);
    setForm(emptyForm());
    setPageSearch("");
    setPageSearchResults([]);
    setShow(true);
  };

  const canImportDocument =
    Boolean(form.pageSlug.trim()) && Boolean(form.pageTitle.trim());

  const showPagePickerResults =
    !formLoading &&
    pageSearchResults.length > 0 &&
    !(form.pageSlug && pageSearch === form.pageTitle);

  const openImportFilePicker = () => {
    if (importParsing || !canImportDocument) return;
    importFileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !canImportDocument) return;

    setImportParsing(true);
    try {
      const imported = await parseListingContentDocument(file, {
        skipPageFields: true,
      });
      patchForm({
        heading: imported.heading || "",
        intro: imported.intro || "",
        content: imported.content || "",
        metaTitle: imported.metaTitle || "",
        metaDescription: imported.metaDescription || "",
        metaKeywords: imported.metaKeywords || "",
      });
      toast.success("Document imported. Review the fields before saving.");
    } catch (error) {
      toast.error(
        error?.message ||
          "Could not import the document. Please check the file format and try again.",
      );
    } finally {
      setImportParsing(false);
    }
  };

  const openEditModel = async (row) => {
    setValidated(false);
    setPageSearch(row.pageTitle || "");
    setPageSearchResults([]);
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
      if (saved) {
        setForm(formFromContent(saved, row));
      }
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
          searchQuery,
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
      <input
        ref={importFileInputRef}
        type="file"
        accept=".docx,.txt,.html,.htm,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/html"
        onChange={handleImportFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
        tabIndex={-1}
      />
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
        <input
          type="search"
          className="listing-content-search"
          placeholder="Search page or slug…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
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
                  <Form.Control
                    type="search"
                    placeholder="Search listing page…"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    disabled={formLoading}
                    autoComplete="off"
                  />
                  {form.pageTitle && form.pageSlug ? (
                    <Form.Text className="d-block mt-1">
                      Selected: <strong>{form.pageTitle}</strong>
                    </Form.Text>
                  ) : null}
                  {pageSearchLoading ? (
                    <Form.Text className="d-block mt-1">Searching pages…</Form.Text>
                  ) : null}
                  {showPagePickerResults ? (
                    <div
                      className="listing-page-picker-results"
                      style={{
                        marginTop: "0.35rem",
                        border: "1px solid #e6e8ec",
                        borderRadius: "10px",
                        maxHeight: "220px",
                        overflowY: "auto",
                      }}
                    >
                      {pageSearchResults.map((item) => (
                        <button
                          key={item.pageSlug}
                          type="button"
                          className="w-100 text-start border-0 bg-white px-3 py-2"
                          style={{
                            borderBottom: "1px solid #f1f3f5",
                            cursor: "pointer",
                          }}
                          onClick={() => selectListingPage(item)}
                        >
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                            {item.pageTitle}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                            {item.pageSlug}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <input
                    type="text"
                    value={form.pageSlug}
                    required
                    readOnly
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                      opacity: 0,
                      height: 0,
                      width: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }}
                    onChange={() => {}}
                  />
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
                      const match = pageSearchResults.find(
                        (opt) => opt.pageSlug === value.trim().toLowerCase(),
                      );
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
              {canImportDocument ? (
                <div className="mt-3">
                  <button
                    type="button"
                    className="admin-header-btn admin-header-btn--secondary"
                    onClick={openImportFilePicker}
                    disabled={importParsing || formLoading}
                  >
                    {importParsing ? "Importing…" : "Import from Document"}
                  </button>
                  <Form.Text className="d-block mt-2">
                    Upload a .docx, .html, or .txt file to fill heading, intro,
                    editor, and meta fields. Page and slug stay as you entered
                    above.
                  </Form.Text>
                </div>
              ) : null}
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
                {show && !formLoading ? (
                  <Editor
                    value={form.content}
                    onChange={(value) => patchForm({ content: value })}
                  />
                ) : (
                  <div className="mpf-modal__empty">Editor will load after page is selected…</div>
                )}
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
          fetchContents(
            paginationModel.page,
            paginationModel.pageSize,
            category,
            searchQuery,
          )
        }
      />
    </>
  );
}
