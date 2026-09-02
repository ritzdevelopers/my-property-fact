"use client";
import { adminApiWithAuth, adminFetchHeaders } from "../../_lib/adminApiAuth";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import { getPublicApiBase } from "@/lib/publicApiBase";
import axios from "axios";
import Cookies from "js-cookie";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useRef, useState, useMemo } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import dynamic from "next/dynamic";
import { toast } from "../../_lib/adminToast";
import CommonModal from "../common-model/common-model";
import ImageUrlPopup from "../common-model/imageiurl-popup";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import {
  AdminGridImageThumb,
} from "../common-model/admin-grid-cells";
import { useRouter } from "next/navigation";
import exportOverlayStyles from "./manageBlogsExportOverlay.module.css";
import styles from "./manageBlogs.module.css";
import {
  AdminFilterCount,
  AdminSummaryFilterCards,
  AdminStatusToggle,
  ContentStatusPill,
} from "../common-model/admin-summary-filter-cards";
import {
  BLOG_STATUS_FILTERS,
  countBlogs,
  filterBlogs,
  getBlogRowClassName,
  getBlogPublicationState,
  getBlogStatusLabel,
  isBlogActive,
  BLOG_STATUS,
} from "../common-model/adminContentFilters";
import BlogPreviewModal from "./BlogPreviewModal";


// 🔥 This prevents SSR errors
const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function parseBlogDate(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    return new Date(y, m - 1, d, h, min, s);
  }
  return null;
}

function formatPublishedDateTime(value) {
  const d = parseBlogDate(value);
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function truncateCell(value, max = 80) {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  if (!s) return "—";
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

function extractImgSrcsFromHtml(html) {
  if (!html || typeof html !== "string") return "";
  const urls = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.push(m[1]);
  }
  return [...new Set(urls)].join("; ");
}

function getPublicUiOrigin() {
  const raw = process.env.NEXT_PUBLIC_UI_URL;
  const base = raw && String(raw).trim() ? String(raw).trim() : "https://mypropertyfact.in";
  return base.replace(/\/+$/, "");
}

function buildPublicUiUrl(pathname) {
  const p = String(pathname || "").trim();
  if (!p) return "";
  const base = getPublicUiOrigin();
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

async function refreshBlogSitemap() {
  try {
    const token =
      typeof window !== "undefined" ? Cookies.get("token") : undefined;
    const response = await fetch("/api/admin/regenerate-blog-sitemaps", {
      method: "POST",
      credentials: "include",
      headers: {
      },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      console.error(
        "Blog sitemap refresh failed:",
        payload?.error || response.statusText,
      );
    }
  } catch (error) {
    console.error("Blog sitemap refresh failed:", error);
  }
}

function parseScheduledFields(value) {
  const d = parseBlogDate(value);
  if (!d) {
    return { scheduleDate: "", scheduleHour: "9", scheduleMinute: "00", scheduleAmPm: "AM" };
  }
  const hours24 = d.getHours();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const pad = (n) => String(n).padStart(2, "0");
  return {
    scheduleDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    scheduleHour: String(hours12),
    scheduleMinute: pad(d.getMinutes()),
    scheduleAmPm: ampm,
  };
}

function buildScheduledIso(date, hour, minute, ampm) {
  if (!date || hour === "" || minute === "") return "";
  const rawHour = Number(hour);
  const rawMinute = Number(minute);
  if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) return "";
  let hours24 = rawHour % 12;
  if (ampm === "PM") hours24 += 12;
  if (ampm === "AM" && rawHour === 12) hours24 = 0;
  if (ampm === "PM" && rawHour === 12) hours24 = 12;
  const pad = (n) => String(n).padStart(2, "0");
  const iso = `${date}T${pad(hours24)}:${pad(rawMinute)}:00`;
  const scheduled = new Date(iso);
  if (Number.isNaN(scheduled.getTime())) return "";
  if (scheduled.getTime() <= Date.now()) return null;
  return iso;
}

function collectBlogFormErrors({
  mode,
  formData,
  scheduleDate,
  scheduleHour,
  scheduleMinute,
  scheduleAmPm,
}) {
  const errors = [];
  const title = String(formData.blogTitle || "").trim();
  const keywords = String(formData.blogKeywords || "").trim();
  const meta = String(formData.blogMetaDescription || "").trim();
  const slug = String(formData.slugUrl || "").trim();
  const category = formData.blogCategory;
  const author = String(formData.authorName || "").trim();

  if (!title) errors.push("Meta title is required");

  if (mode === "draft") {
    if (!slug) errors.push("Slug URL is required");
  } else {
    if (!keywords) errors.push("Blog keywords are required");
    if (!meta) errors.push("Blog meta description is required");
    if (!category) errors.push("Blog category is required");
    if (!author) errors.push("Author name is required");
    if (!slug) errors.push("Slug URL is required");
    if (String(category) === "5" && !Number(formData.cityId)) {
      errors.push("City is required for the City category");
    }
  }

  if (mode === "schedule") {
    if (!scheduleDate) {
      errors.push("Schedule date is required");
    } else {
      const scheduledPublishAt = buildScheduledIso(
        scheduleDate,
        scheduleHour,
        scheduleMinute,
        scheduleAmPm,
      );
      if (scheduledPublishAt === null) {
        errors.push("Scheduled time must be in the future");
      } else if (!scheduledPublishAt) {
        errors.push("Invalid schedule date or time");
      }
    }
  }

  return errors;
}

function stripHtmlText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasDraftableBlogContent(formData, blogDescription) {
  if (formData?.blogImage) return true;
  return [
    formData?.blogTitle,
    formData?.blogKeywords,
    formData?.blogMetaDescription,
    formData?.slugUrl,
    formData?.authorName,
    formData?.blogCategory,
    stripHtmlText(blogDescription),
  ].some((value) => String(value ?? "").trim());
}

function slugifyForAutoDraft(title) {
  const base = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "untitled-draft";
}

function prepareAutoDraftFields(formData, blogId) {
  const title = String(formData.blogTitle || "").trim() || "Untitled draft";
  let slug = String(formData.slugUrl || "").trim();
  if (!slug) {
    slug = `${slugifyForAutoDraft(title)}-${Date.now()}`;
  }
  return {
    ...formData,
    blogTitle: title,
    blogKeywords: String(formData.blogKeywords || "").trim(),
    blogMetaDescription: String(formData.blogMetaDescription || "").trim(),
    slugUrl: slug,
    id: blogId > 0 ? blogId : 0,
  };
}

function createBlogFormSnapshot(formData, blogDescription, currentBlogId) {
  return JSON.stringify({
    blogId: currentBlogId,
    blogTitle: formData.blogTitle || "",
    blogKeywords: formData.blogKeywords || "",
    blogMetaDescription: formData.blogMetaDescription || "",
    slugUrl: formData.slugUrl || "",
    authorName: formData.authorName || "",
    blogCategory: formData.blogCategory || "",
    cityId: formData.cityId || 0,
    blogDescription: blogDescription || "",
  });
}

function buildBlogFormData(payload, blogDescription, status, scheduledPublishAt = "") {
  const data = new FormData();
  data.append("blogTitle", payload.blogTitle);
  data.append("blogKeywords", payload.blogKeywords);
  data.append("blogMetaDescription", payload.blogMetaDescription);
  data.append("blogDescription", blogDescription || "");
  data.append("slugUrl", payload.slugUrl);
  if (payload.blogImage) {
    data.append("image", payload.blogImage);
  }
  data.append("authorName", payload.authorName || "");
  data.append("blogCategory", payload.blogCategory);
  data.append("id", payload.id);
  data.append("cityId", payload.cityId);
  data.append("status", String(status));
  if (scheduledPublishAt) {
    data.append("scheduledPublishAt", scheduledPublishAt);
  }
  return data;
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Image fetch ${res.status}`);
  const blob = await res.blob();
  const ext = blob.type.includes("png")
    ? "png"
    : blob.type.includes("gif")
      ? "gif"
      : "jpeg";
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const b64 =
        typeof dataUrl === "string" ? dataUrl.split(",")[1] : null;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  if (!base64) throw new Error("Could not read image");
  return { base64, extension: ext };
}

const EXCEL_EXPORT_UI_INITIAL = {
  open: false,
  phase: "idle",
  step: "images",
  imageDone: 0,
  imageTotal: 0,
};

const BLOG_AUTHORS = [
  "Aryan Tomar",
  "Shorye Verma",
  "Akansha Verma",
  "Manav Raj Chopra",
  "Aditya Bishwakarma",
  "mohd khubeb",
  "Soniya Joshi",
  "Utpanna Shrivastava",
  "Syed Arhan Rizvi",
  "Varun Mathur",
  "Alisba Ansari",
];

export default function ManageBlogs({ list, categoryList, cityList }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(null);
  const [buttonName, setButtonName] = useState("Submit");
  const [showLoading, setShowLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [blogDescription, setBlogDescription] = useState("");
  const [blogId, setBlogId] = useState(0);
  const [confirmBox, setConfirmBox] = useState(false);
  const [previousBlogImage, setPreviousBlogImage] = useState(null);
  const [urlPopUp, setUrlPopUp] = useState(false);
  const router = useRouter();
  const [isShowCityDropDown, setIsShowCityDropDown] = useState(false);
  const [excelExportUi, setExcelExportUi] = useState(EXCEL_EXPORT_UI_INITIAL);
  const excelExportInProgressRef = useRef(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishMode, setPublishMode] = useState("publish");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleHour, setScheduleHour] = useState("9");
  const [scheduleMinute, setScheduleMinute] = useState("00");
  const [scheduleAmPm, setScheduleAmPm] = useState("AM");
  const [publishingBlogIds, setPublishingBlogIds] = useState(() => new Set());
  const [submittingMode, setSubmittingMode] = useState(null);
  const [blogs, setBlogs] = useState(list || []);
  const [togglingBlogIds, setTogglingBlogIds] = useState(() => new Set());
  const [previewBlog, setPreviewBlog] = useState(null);
  const blogFormRef = useRef(null);
  const blogImageInputRef = useRef(null);
  const modalFormSnapshotRef = useRef(null);
  const skipDraftOnCloseRef = useRef(false);
  const autoDraftSavingRef = useRef(false);

  useEffect(() => {
    setBlogs(Array.isArray(list) ? list : []);
  }, [list]);

  const blogCounts = useMemo(() => countBlogs(blogs), [blogs]);
  const filteredBlogList = useMemo(
    () => filterBlogs(blogs, statusFilter),
    [blogs, statusFilter],
  );
  const activeBlogFilter = BLOG_STATUS_FILTERS.find((item) => item.id === statusFilter);

  const handleToggleBlogStatus = async (blog, makeActive) => {
    const blogId = blog?.id;
    if (!blogId || togglingBlogIds.has(blogId)) return;

    setTogglingBlogIds((prev) => new Set(prev).add(blogId));
    const nextStatus = makeActive ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.INACTIVE;

    try {
      const apiBase = getPublicApiBase();
      const response = await axios.post(
        `${apiBase}blog/update-status?id=${blogId}&status=${nextStatus}`,
        {},
        adminApiWithAuth(),
      );

      if (response.data?.isSuccess !== 1) {
        toast.error(response.data?.message || "Could not update blog status");
        return;
      }

      setBlogs((prev) =>
        prev.map((item) =>
          item.id === blogId ? { ...item, status: nextStatus } : item,
        ),
      );
      toast.success(
        makeActive
          ? "Blog is active and visible on the website"
          : "Blog is inactive and hidden from the website",
      );
      if (makeActive) {
        await refreshBlogSitemap();
      }
      router.refresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update blog status",
      );
    } finally {
      setTogglingBlogIds((prev) => {
        const next = new Set(prev);
        next.delete(blogId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (excelExportUi.phase !== "success" || !excelExportUi.open) return;
    const t = setTimeout(() => {
      setExcelExportUi(EXCEL_EXPORT_UI_INITIAL);
    }, 2800);
    return () => clearTimeout(t);
  }, [excelExportUi.phase, excelExportUi.open]);

  //Definign input fields for blog form

  const inputFields = {
    blogTitle: "",
    blogKeywords: "",
    blogMetaDescription: "",
    blogDescription: "",
    slugUrl: "",
    blogImage: null,
    authorName: "",
    status: 1,
    blogCategory: "",
    id: 0,
    cityId: 0,
  };

  const [formData, setFormData] = useState(inputFields);
  const newImagePreviewUrl = useMemo(() => {
    if (formData.blogImage instanceof File) {
      return URL.createObjectURL(formData.blogImage);
    }
    return null;
  }, [formData.blogImage]);

  useEffect(() => {
    return () => {
      if (newImagePreviewUrl) URL.revokeObjectURL(newImagePreviewUrl);
    };
  }, [newImagePreviewUrl]);

  const authorOptions = useMemo(() => {
    const currentAuthor = String(formData.authorName || "").trim();
    if (currentAuthor && !BLOG_AUTHORS.includes(currentAuthor)) {
      return [currentAuthor, ...BLOG_AUTHORS];
    }
    return BLOG_AUTHORS;
  }, [formData.authorName]);

  const resetScheduleFields = () => {
    setPublishMode("publish");
    setScheduleDate("");
    setScheduleHour("9");
    setScheduleMinute("00");
    setScheduleAmPm("AM");
  };

  const resetModalForm = () => {
    setShowModal(false);
    setValidated(false);
    setIsShowCityDropDown(false);
    setFormData(inputFields);
    setBlogDescription("");
    setPreviousBlogImage(null);
    setBlogId(0);
    resetScheduleFields();
    modalFormSnapshotRef.current = null;
    skipDraftOnCloseRef.current = false;
    if (blogImageInputRef.current) blogImageInputRef.current.value = "";
  };

  const rememberModalSnapshot = (snapshotFormData, snapshotDescription, snapshotBlogId) => {
    modalFormSnapshotRef.current = createBlogFormSnapshot(
      snapshotFormData,
      snapshotDescription,
      snapshotBlogId,
    );
    skipDraftOnCloseRef.current = false;
  };

  const isBlogFormDirty = () => {
    if (formData.blogImage) return true;
    if (!modalFormSnapshotRef.current) return true;
    const currentSnapshot = createBlogFormSnapshot(formData, blogDescription, blogId);
    return currentSnapshot !== modalFormSnapshotRef.current;
  };

  const shouldAutoSaveDraftOnClose = () => {
    if (skipDraftOnCloseRef.current || showLoading || autoDraftSavingRef.current) {
      return false;
    }
    if (!hasDraftableBlogContent(formData, blogDescription)) return false;
    if (!isBlogFormDirty()) return false;

    if (blogId === 0) return true;

    const existing = blogs.find((item) => item.id === blogId);
    const state = existing ? getBlogPublicationState(existing) : "draft";
    return state === "draft" || state === "scheduled";
  };

  const persistBlogRequest = async (data, status) => {
    const apiBase = getPublicApiBase();
    const token =
      typeof window !== "undefined" ? Cookies.get("token") : undefined;
    const response = await axios.post(`${apiBase}blog/add-update`, data, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { response, status };
  };

  const saveDraftOnClose = async () => {
    const draftFields = prepareAutoDraftFields(formData, blogId);
    if (!draftFields.blogCategory && Array.isArray(categoryList) && categoryList.length) {
      draftFields.blogCategory = categoryList[0].id;
    }
    if (!draftFields.blogCategory) {
      return false;
    }
    const data = buildBlogFormData(
      draftFields,
      blogDescription,
      BLOG_STATUS.DRAFT,
    );
    const { response } = await persistBlogRequest(data, BLOG_STATUS.DRAFT);
    return response.data?.isSuccess === 1;
  };

  const handleModalClose = async () => {
    if (shouldAutoSaveDraftOnClose()) {
      autoDraftSavingRef.current = true;
      try {
        const saved = await saveDraftOnClose();
        if (saved) {
          toast.info("Your work was saved as a draft.");
          router.refresh();
        } else {
          toast.warning("Could not save draft automatically. Use Save draft before closing.");
        }
      } catch (error) {
        toast.warning(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Could not save draft automatically.",
        );
      } finally {
        autoDraftSavingRef.current = false;
      }
    }
    resetModalForm();
  };

  const handlePublishNow = async (blog) => {
    const blogIdToPublish = blog?.id;
    if (!blogIdToPublish || publishingBlogIds.has(blogIdToPublish)) return;

    setPublishingBlogIds((prev) => new Set(prev).add(blogIdToPublish));
    try {
      const apiBase = getPublicApiBase();
      const response = await axios.post(
        `${apiBase}blog/publish?id=${blogIdToPublish}`,
        {},
        adminApiWithAuth(),
      );

      if (response.data?.isSuccess !== 1) {
        toast.error(response.data?.message || "Could not publish blog");
        return;
      }

      setBlogs((prev) =>
        prev.map((item) =>
          item.id === blogIdToPublish
            ? { ...item, status: BLOG_STATUS.PUBLISHED, scheduledPublishAt: null }
            : item,
        ),
      );
      toast.success(response.data?.message || "Blog published successfully.");
      await refreshBlogSitemap();
      router.refresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to publish blog",
      );
    } finally {
      setPublishingBlogIds((prev) => {
        const next = new Set(prev);
        next.delete(blogIdToPublish);
        return next;
      });
    }
  };

  const submitBlog = async (mode = "publish") => {
    const errors = collectBlogFormErrors({
      mode,
      formData,
      scheduleDate,
      scheduleHour,
      scheduleMinute,
      scheduleAmPm,
    });

    if (errors.length > 0) {
      setValidated(true);
      toast.error(errors[0]);
      blogFormRef.current?.querySelector(":invalid")?.focus?.();
      return;
    }

    setPublishMode(mode);
    setSubmittingMode(mode);
    setShowLoading(true);
    setButtonName("");

    let status = BLOG_STATUS.PUBLISHED;
    let scheduledPublishAt = "";

    if (mode === "draft") {
      status = BLOG_STATUS.DRAFT;
    } else if (mode === "schedule") {
      status = BLOG_STATUS.SCHEDULED;
      scheduledPublishAt = buildScheduledIso(
        scheduleDate,
        scheduleHour,
        scheduleMinute,
        scheduleAmPm,
      );
    }

    const payload = { ...formData, id: blogId > 0 ? blogId : formData.id };
    const data = buildBlogFormData(
      payload,
      blogDescription,
      status,
      scheduledPublishAt,
    );

    try {
      const { response } = await persistBlogRequest(data, status);

      if (response.data.isSuccess === 1) {
        if (status === BLOG_STATUS.PUBLISHED) {
          await refreshBlogSitemap();
        }
        router.refresh();
        toast.success(response.data.message);
        skipDraftOnCloseRef.current = true;
        resetModalForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors && typeof errorData.errors === "object") {
          toast.error(Object.values(errorData.errors).join(", "));
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          toast.error(error.response.statusText || "An error occurred");
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setShowLoading(false);
      setSubmittingMode(null);
      setButtonName("Add Blog");
    }
  };

  //Handle deletion of blog
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setBlogId(id);
  };

  //Handling edition of Blog
  const openEditModel = (item) => {
    setTitle("Edit Blog");
    setButtonName("Update");
    setShowModal(true);
    setValidated(false);
    setBlogId(item.id);
    setBlogDescription(item.blogDescription);
    setPreviousBlogImage(item.blogImage);
    item.categoryId == 5
      ? setIsShowCityDropDown(true)
      : setIsShowCityDropDown(false);

    setFormData({
      blogTitle: item.blogTitle,
      blogKeywords: item.blogKeywords,
      blogMetaDescription: item.blogMetaDescription,
      slugUrl: item.slugUrl,
      authorName: item.authorName || "",
      blogCategory: item.categoryId,
      status: item.status !== undefined ? item.status : BLOG_STATUS.PUBLISHED,
      id: item.id,
      cityId: item.cityId,
    });

    const publicationState = getBlogPublicationState(item);
    if (publicationState === "scheduled") {
      setPublishMode("schedule");
      const scheduleFields = parseScheduledFields(item.scheduledPublishAt);
      setScheduleDate(scheduleFields.scheduleDate);
      setScheduleHour(scheduleFields.scheduleHour);
      setScheduleMinute(scheduleFields.scheduleMinute);
      setScheduleAmPm(scheduleFields.scheduleAmPm);
    } else if (publicationState === "draft") {
      setPublishMode("draft");
      setScheduleDate("");
      setScheduleHour("9");
      setScheduleMinute("00");
      setScheduleAmPm("AM");
    } else {
      setPublishMode("publish");
      resetScheduleFields();
    }

    rememberModalSnapshot(
      {
        blogTitle: item.blogTitle,
        blogKeywords: item.blogKeywords,
        blogMetaDescription: item.blogMetaDescription,
        slugUrl: item.slugUrl,
        authorName: item.authorName || "",
        blogCategory: item.categoryId,
        cityId: item.cityId,
      },
      item.blogDescription,
      item.id,
    );
  };

  //Handle setting input fields values
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      if (name === "blogCategory") {
        if (value === "5") {
          setIsShowCityDropDown(true);
        } else {
          setIsShowCityDropDown(false);
        }
      }
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  //Handle opening of add blog form
  const openAddModel = () => {
    setTitle("Add Blog");
    setShowModal(true);
    setValidated(false);
    setButtonName("Add Blog");
    setFormData(inputFields);
    setBlogDescription("");
    setPreviousBlogImage(null);
    setBlogId(0);
    setIsShowCityDropDown(false);
    resetScheduleFields();
    rememberModalSnapshot(inputFields, "", 0);
  };

  //handling opening of image urls popup
  const openImageUrlPopup = () => {
    setUrlPopUp(true);
  };

  const exportBlogsToExcel = async () => {
    const blogs = Array.isArray(list) ? [...list] : [];
    if (!blogs.length) {
      toast.warning("No blogs to export.");
      return;
    }
    if (excelExportInProgressRef.current) return;
    excelExportInProgressRef.current = true;

    const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
    const imageTotal = blogs.filter(
      (b) => !!(b.blogImage && String(b.blogImage).trim())
    ).length;

    setExcelExportUi({
      open: true,
      phase: "loading",
      step: "images",
      imageDone: 0,
      imageTotal,
    });

    const headers = [
      "S.no",
      "ID",
      "Title",
      "Keywords",
      "Meta description",
      "Description (HTML)",
      "Slug URL",
      "Full Blog URL",
      "Author Name",
      "Category",
      "City",
      "Status",
      "Category ID",
      "City ID",
      "Published at",
      "Featured image filename",
      "Featured image URL",
      "Inline content image URLs",
      "Thumbnail",
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Blogs");
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF228B22" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    const thumbColIndex = headers.length - 1;
    let featuredImagesProcessed = 0;

    try {
      for (let rowIndex = 0; rowIndex < blogs.length; rowIndex++) {
        const b = blogs[rowIndex];
        const featuredFile = b.blogImage || "";
        const featuredUrl = featuredFile
          ? `${imageBase}blog/${featuredFile}`
          : "";
        const slug = String(b.slugUrl ?? "").trim();
        const fullBlogUrl = slug ? buildPublicUiUrl(`/blog/${slug}`) : "";
        const published = parseBlogDate(b.createdAt);
        const publishedStr = published
          ? published.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "medium",
            })
          : "";

        const rowValues = [
          b.index ?? rowIndex + 1,
          b.id,
          b.blogTitle ?? "",
          b.blogKeywords ?? "",
          b.blogMetaDescription ?? "",
          b.blogDescription ?? "",
          slug,
          fullBlogUrl,
          b.authorName ?? "",
          b.blogCategory ?? "",
          b.cityName ?? "",
          b.status === BLOG_STATUS.PUBLISHED
            ? "Published"
            : b.status === BLOG_STATUS.DRAFT
              ? "Draft"
              : b.status === BLOG_STATUS.SCHEDULED
                ? "Scheduled"
                : "Inactive",
          b.categoryId ?? "",
          b.cityId ?? "",
          publishedStr,
          featuredFile,
          featuredUrl,
          extractImgSrcsFromHtml(b.blogDescription || ""),
          "",
        ];

        worksheet.addRow(rowValues);

        if (featuredUrl) {
          try {
            const { base64, extension } = await fetchImageAsBase64(featuredUrl);
            const imageId = workbook.addImage({ base64, extension });
            worksheet.addImage(imageId, {
              tl: { col: thumbColIndex, row: rowIndex + 1 },
              ext: { width: 220, height: 120 },
            });
            worksheet.getRow(rowIndex + 2).height = 95;
          } catch {
            /* CORS or missing file — URL remains in sheet */
          }
          featuredImagesProcessed += 1;
          setExcelExportUi((prev) => ({
            ...prev,
            imageDone: featuredImagesProcessed,
          }));
        }
      }

      worksheet.columns.forEach((col, idx) => {
        if (idx === 5) {
          col.width = 50;
          return;
        }
        if (idx === thumbColIndex) {
          col.width = 32;
          return;
        }
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value != null ? String(cell.value).length : 0;
          if (len > maxLength) maxLength = len;
        });
        col.width = Math.min(maxLength + 2, 45);
      });

      setExcelExportUi((prev) => ({ ...prev, step: "finalize" }));

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .split(".")[0];
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `blogs_export_${timestamp}.xlsx`);
      setExcelExportUi((prev) => ({ ...prev, phase: "success" }));
    } catch {
      toast.error("Export failed. Please try again.");
      setExcelExportUi(EXCEL_EXPORT_UI_INITIAL);
    } finally {
      excelExportInProgressRef.current = false;
    }
  };

  // Table aligned with executive amenities design — featured image kept in grid
  const truncCell = (val, max = 70) => {
    const s = val == null ? "—" : String(val).trim() || "—";
    return (
      <span title={s} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "100%" }}>
        {s.length > max ? `${s.slice(0, max)}…` : s}
      </span>
    );
  };

  const columns = [
    {
      field: "blogTitle",
      headerName: "Title",
      flex: 1,
      minWidth: 180,
      renderCell: (p) => truncCell(p.value, 60),
    },
    {
      field: "blogImage",
      headerName: "Blog Image",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <AdminGridImageThumb
          src={
            params.row.blogImage
              ? `${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${params.row.blogImage}`
              : null
          }
          alt={params.row.blogTitle || "Blog"}
          onPreviewClick={(src, alt) => setImagePreview({ src, alt })}
        />
      ),
    },
    {
      field: "altPreview",
      headerName: "Alt tag",
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params) =>
        truncCell(params.row.blogMetaDescription || params.row.blogKeywords, 60),
    },
    {
      field: "authorName",
      headerName: "Author",
      minWidth: 180,
      flex: 0.8,
      renderCell: (p) => truncCell(p.value || "—", 30),
    },
    {
      field: "blogCategory",
      headerName: "Category",
      minWidth: 130,
      flex: 0.6,
      renderCell: (p) => truncCell(p.value, 20),
    },
    {
      field: "status",
      headerName: "Status",
      width: 240,
      sortable: false,
      cellClassName: "blog-status-cell",
      renderCell: (params) => {
        const state = getBlogPublicationState(params.row);
        const busyToggle = togglingBlogIds.has(params.row.id);
        const busyPublish = publishingBlogIds.has(params.row.id);

        if (state === "draft" || state === "scheduled") {
          return (
            <div className={styles.blogGridStatus}>
              <ContentStatusPill
                variant={state === "scheduled" ? "pending" : "unverified"}
              >
                {getBlogStatusLabel(params.row)}
              </ContentStatusPill>
              {state === "scheduled" && params.row.scheduledPublishAt ? (
                <span className={styles.blogGridStatusWhen}>
                  {formatPublishedDateTime(params.row.scheduledPublishAt)}
                </span>
              ) : null}
              <Button
                size="sm"
                variant="success"
                className={styles.blogGridPublishBtn}
                disabled={busyPublish}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePublishNow(params.row);
                }}
              >
                {busyPublish ? "Publishing..." : "Publish now"}
              </Button>
            </div>
          );
        }

        const active = isBlogActive(params.row);
        return (
          <AdminStatusToggle
            id={`blog-status-${params.row.id}`}
            checked={active}
            disabled={busyToggle}
            onChange={(checked) => handleToggleBlogStatus(params.row, checked)}
            activeLabel="Active"
            inactiveLabel="Inactive"
          />
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 160,
      renderCell: (params) => formatPublishedDateTime(params.row.createdAt),
    },
    {
      field: "role",
      headerName: "Role",
      width: 80,
      sortable: false,
      renderCell: () => "—",
    },
    {
      field: "action",
      headerName: "Action",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <div className="admin-grid-actions">
          <button
            type="button"
            title="Preview blog"
            className="admin-grid-action admin-grid-action--preview"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewBlog(params.row);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            title="Delete"
            className="admin-grid-action admin-grid-action--delete"
            onClick={(e) => {
              e.stopPropagation();
              openConfirmationBox(params.row.id);
            }}
          >
            <img src="/images/admin/delete.svg" alt="" width={12} height={15} style={{ pointerEvents: "none" }} />
          </button>
          <button
            type="button"
            title="Edit"
            className="admin-grid-action admin-grid-action--edit"
            onClick={(e) => {
              e.stopPropagation();
              openEditModel(params.row);
            }}
          >
            <img src="/images/admin/edit.svg" alt="" width={14} height={14} style={{ pointerEvents: "none" }} />
          </button>
        </div>
      ),
    },
  ];
  return (
    <>
      <Modal
        show={excelExportUi.open}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName={exportOverlayStyles.overlayModal}
      >
        <Modal.Body
          className={exportOverlayStyles.body}
          role={excelExportUi.phase === "loading" ? "status" : undefined}
          aria-live={excelExportUi.phase === "loading" ? "polite" : undefined}
        >
          {excelExportUi.phase === "loading" && (
            <>
              <div className={exportOverlayStyles.spinnerWrap} aria-hidden>
                <div className={exportOverlayStyles.spinnerRing} />
                <div className={exportOverlayStyles.spinnerRingInner} />
              </div>
              {excelExportUi.step === "finalize" ? (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Finalizing spreadsheet…
                  </p>
                  <p className={exportOverlayStyles.subtle}>
                    Almost ready — packing your Excel file.
                  </p>
                </>
              ) : excelExportUi.imageTotal > 0 ? (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Image compression is going on please wait
                  </p>
                  <p className={exportOverlayStyles.counterLabel}>Progress</p>
                  <p className={exportOverlayStyles.counter}>
                    {excelExportUi.imageDone} / {excelExportUi.imageTotal}
                  </p>
                </>
              ) : (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Preparing your Excel file…
                  </p>
                  <p className={exportOverlayStyles.subtle}>
                    No featured images to embed — building the sheet.
                  </p>
                </>
              )}
            </>
          )}
          {excelExportUi.phase === "success" && (
            <div className={exportOverlayStyles.successWrap}>
              <svg
                className={exportOverlayStyles.tickSvg}
                viewBox="0 0 52 52"
                aria-hidden
              >
                <circle
                  className={exportOverlayStyles.tickCircle}
                  cx="26"
                  cy="26"
                  r="24"
                />
                <path
                  className={exportOverlayStyles.tickPath}
                  d="M14 28l9 9 17-20"
                />
              </svg>
              <p className={exportOverlayStyles.successTitle}>
                Sheet is downloaded
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={!!imagePreview}
        onHide={() => setImagePreview(null)}
        centered
        contentClassName="admin-image-lightbox-modal"
        dialogClassName="admin-image-lightbox-dialog"
      >
        <Modal.Body className="admin-image-lightbox-body border-0 position-relative">
          <button
            type="button"
            className="btn-close admin-image-lightbox-close"
            aria-label="Close"
            onClick={() => setImagePreview(null)}
          />
          {imagePreview ? (
            <div className="admin-image-lightbox-inner">
              <img
                src={imagePreview.src}
                alt={imagePreview.alt}
                width={1200}
                height={900}
                className="admin-image-lightbox-img"
              />
            </div>
          ) : null}
        </Modal.Body>
      </Modal>
      <DashboardHeader
        buttonName={"+ Add New Blog"}
        functionName={openAddModel}
        heading={"Manage Blogs"}
        pageStyle="executive"
        exportExcel={"Export to Excel"}
        exportFunction={exportBlogsToExcel}
        exportDisabled={
          excelExportUi.open && excelExportUi.phase === "loading"
        }
      />
      <div className={`manage-users-page ${styles.page}`}>
        <AdminSummaryFilterCards
          filters={BLOG_STATUS_FILTERS}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          counts={blogCounts}
          ariaLabel="Filter blogs by status"
        />
        <div className={`manage-users-toolbar ${styles.toolbar}`}>
          <AdminFilterCount
            filteredCount={filteredBlogList.length}
            totalCount={blogs.length}
            activeFilter={statusFilter}
            activeFilterLabel={activeBlogFilter?.shortLabel}
            onClear={() => setStatusFilter("all")}
          />
        </div>
      </div>
      <div className={`admin-datagrid-scroll-host admin-datagrid-scroll-host--executive table-container ${styles.tableWrap} ${styles.dataGridHost}`}>
        <DataTable
          columns={columns}
          list={filteredBlogList}
          getRowClassName={getBlogRowClassName}
          getRowHeight={(params) => {
            const state = getBlogPublicationState(params.model);
            return state === "draft" || state === "scheduled" ? 96 : 56;
          }}
          dataGridSx={{
            "& .blog-status-cell": {
              whiteSpace: "normal",
              overflow: "visible",
              alignItems: "flex-start",
              py: 0.75,
            },
            "& .MuiDataGrid-row.mu-row--pending .MuiDataGrid-cell": {
              alignItems: "flex-start",
            },
            "& .MuiDataGrid-row.mu-row--unverified .MuiDataGrid-cell": {
              alignItems: "flex-start",
            },
            "& .MuiDataGrid-row.mu-row--disabled .MuiDataGrid-cell": {
              color: "#6b7280",
            },
            "& .MuiDataGrid-row.mu-row--disabled .MuiDataGrid-cell:first-of-type": {
              boxShadow: "inset 3px 0 0 #ef4444",
            },
            "& .MuiDataGrid-row.mu-row--unverified .MuiDataGrid-cell:first-of-type": {
              boxShadow: "inset 3px 0 0 #3b82f6",
            },
            "& .MuiDataGrid-row.mu-row--pending .MuiDataGrid-cell:first-of-type": {
              boxShadow: "inset 3px 0 0 #f59e0b",
            },
            "& .MuiDataGrid-row.mu-row--active .MuiDataGrid-cell:first-of-type": {
              boxShadow: "inset 3px 0 0 #16a34a",
            },
          }}
        />
      </div>
      {/* Blog form */}
      <Modal
        size="xl"
        show={showModal}
        onHide={handleModalClose}
        centered
        scrollable
        enforceFocus={false}
        dialogClassName={`admin-modal-dialog admin-modal-dialog-wide ${styles.blogModalDialog}`}
        contentClassName={`admin-modal-surface ${styles.blogModal}`}
      >
        <Modal.Header closeButton>
          <div className={styles.modalTitleWrap}>
            <Modal.Title>{title}</Modal.Title>
            <p className={styles.modalSubtitle}>
              {blogId > 0
                ? "Update content, SEO details, and publication settings."
                : "Fill in blog details, add content, and choose how to publish."}
            </p>
          </div>
        </Modal.Header>
        <Form
          ref={blogFormRef}
          id="blog-admin-form"
          className={styles.blogForm}
          noValidate
          validated={validated}
          onSubmit={(e) => e.preventDefault()}
        >
          <Modal.Body className={styles.blogModalBody}>
            <div className={styles.formGrid}>
              {/* Left column — SEO & metadata */}
              <div className={styles.formCol}>
                <p className={styles.sectionTitle}>SEO &amp; metadata</p>

                <Form.Group className={styles.fieldGroup} controlId="blogTitle">
                  <Form.Label>Meta title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter meta title"
                    name="blogTitle"
                    value={formData.blogTitle || ""}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className={styles.fieldGroup} controlId="blogKeywords">
                  <Form.Label>Blog keywords</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Comma-separated keywords"
                    name="blogKeywords"
                    value={formData.blogKeywords || ""}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className={styles.fieldGroup} controlId="blogMetaDescription">
                  <Form.Label>Blog meta description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Brief description for search engines"
                    name="blogMetaDescription"
                    value={formData.blogMetaDescription || ""}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className={styles.fieldGroup} controlId="slugUrl">
                  <Form.Label>Slug URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="blog-post-slug"
                    name="slugUrl"
                    value={formData.slugUrl || ""}
                    onChange={handleChange}
                    required
                  />
                  <p className={styles.fieldHint}>Used in the public blog URL path.</p>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Right column — Details & media */}
              <div className={styles.formCol}>
                <p className={styles.sectionTitle}>Details &amp; media</p>

                <Form.Group className={styles.fieldGroup} controlId="blogCategory">
                  <Form.Label>Blog category</Form.Label>
                  <Form.Select
                    name="blogCategory"
                    value={formData.blogCategory || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categoryList.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.categoryName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className={styles.fieldGroup} controlId="authorName">
                  <Form.Label>Author name</Form.Label>
                  <Form.Select
                    name="authorName"
                    value={formData.authorName || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select author</option>
                    {authorOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>

                {isShowCityDropDown && (
                  <Form.Group className={styles.fieldGroup} controlId="cityId">
                    <Form.Label>City</Form.Label>
                    <Form.Select
                      name="cityId"
                      value={formData.cityId || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select city</option>
                      {cityList.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.cityName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  </Form.Group>
                )}

                <Form.Group className={styles.fieldGroup} controlId="blogImage">
                  <Form.Label>Featured image</Form.Label>
                  <div className={styles.imageUploadCard}>
                    <div className={styles.imagePreviewWrap}>
                      {newImagePreviewUrl ? (
                        <img
                          src={newImagePreviewUrl}
                          alt="New blog featured image preview"
                          className={styles.imagePreview}
                        />
                      ) : previousBlogImage ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${previousBlogImage}`}
                          alt="Current blog featured image"
                          className={styles.imagePreview}
                        />
                      ) : (
                        <div className={styles.imagePreviewEmpty}>
                          <span className={styles.imagePreviewEmptyIcon} aria-hidden>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </span>
                          <p className={styles.imagePreviewEmptyText}>No image selected</p>
                          <p className={styles.imagePreviewEmptyHint}>PNG, JPG or WEBP recommended</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={blogImageInputRef}
                      type="file"
                      name="blogImage"
                      accept="image/*"
                      className={styles.imageFileInput}
                      onChange={handleChange}
                      tabIndex={-1}
                    />
                    <div className={styles.uploadActions}>
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => blogImageInputRef.current?.click()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" x2="12" y1="3" y2="15" />
                        </svg>
                        {previousBlogImage || newImagePreviewUrl ? "Replace image" : "Upload image"}
                      </button>
                      <Button
                        type="button"
                        variant="light"
                        className={styles.imageUrlsBtn}
                        onClick={openImageUrlPopup}
                      >
                        Image URLs
                      </Button>
                    </div>
                  </div>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>
              </div>

              {/* Full width — Content editor */}
              <div className={`${styles.formColFull} ${styles.editorSection}`}>
                <div className={styles.editorSectionHeader}>Blog content</div>
                <div className={styles.editorWrap}>
                  <Editor value={blogDescription} onChange={setBlogDescription} />
                </div>
              </div>

              {/* Full width — Publication */}
              <div className={`${styles.formColFull} ${styles.fieldGroup}`}>
                <p className={styles.sectionTitle}>Publication</p>
                <div className={styles.publicationPanel}>
                  <p className={styles.publicationIntro}>
                    Choose when this blog should go live. Scheduled posts publish automatically at the selected time.
                  </p>
                  <div className={styles.publicationOptions} role="radiogroup" aria-label="Publication mode">
                    <label
                      className={`${styles.publicationOption}${
                        publishMode === "publish" ? ` ${styles.publicationOptionActive}` : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className={styles.publicationOptionInput}
                        name="publishMode"
                        checked={publishMode === "publish"}
                        onChange={() => setPublishMode("publish")}
                      />
                      <span className={styles.publicationOptionLabel}>Publish now</span>
                      <span className={styles.publicationOptionHint}>Make live immediately</span>
                    </label>
                    <label
                      className={`${styles.publicationOption}${
                        publishMode === "draft" ? ` ${styles.publicationOptionActive}` : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className={styles.publicationOptionInput}
                        name="publishMode"
                        checked={publishMode === "draft"}
                        onChange={() => setPublishMode("draft")}
                      />
                      <span className={styles.publicationOptionLabel}>Save as draft</span>
                      <span className={styles.publicationOptionHint}>Keep hidden until ready</span>
                    </label>
                    <label
                      className={`${styles.publicationOption}${
                        publishMode === "schedule" ? ` ${styles.publicationOptionActive}` : ""
                      }`}
                    >
                      <input
                        type="radio"
                        className={styles.publicationOptionInput}
                        name="publishMode"
                        checked={publishMode === "schedule"}
                        onChange={() => setPublishMode("schedule")}
                      />
                      <span className={styles.publicationOptionLabel}>Schedule post</span>
                      <span className={styles.publicationOptionHint}>Set a future date &amp; time</span>
                    </label>
                  </div>

                  {publishMode === "schedule" && (
                    <div className={styles.scheduleFields}>
                      <Form.Group controlId="scheduleDate">
                        <Form.Label>Schedule date</Form.Label>
                        <Form.Control
                          type="date"
                          value={scheduleDate}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setScheduleDate(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group controlId="scheduleHour">
                        <Form.Label>Hour</Form.Label>
                        <Form.Select
                          value={scheduleHour}
                          onChange={(e) => setScheduleHour(e.target.value)}
                        >
                          {Array.from({ length: 12 }, (_, index) => {
                            const hour = String(index + 1);
                            return (
                              <option key={hour} value={hour}>
                                {hour}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId="scheduleMinute">
                        <Form.Label>Minute</Form.Label>
                        <Form.Select
                          value={scheduleMinute}
                          onChange={(e) => setScheduleMinute(e.target.value)}
                        >
                          {["00", "15", "30", "45"].map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId="scheduleAmPm">
                        <Form.Label>AM / PM</Form.Label>
                        <Form.Select
                          value={scheduleAmPm}
                          onChange={(e) => setScheduleAmPm(e.target.value)}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className={styles.blogModalFooter}>
            <Button
              type="button"
              variant="light"
              className={styles.footerBtnCancel}
              disabled={showLoading}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            {publishMode !== "draft" ? (
              <Button
                type="button"
                variant="outline-success"
                className={styles.footerBtnSave}
                disabled={showLoading}
                onClick={() => submitBlog("draft")}
              >
                Save draft{" "}
                <LoadingSpinner show={showLoading && submittingMode === "draft"} />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="success"
              className={styles.footerBtnPrimary}
              disabled={showLoading}
              onClick={() =>
                submitBlog(
                  publishMode === "schedule"
                    ? "schedule"
                    : publishMode === "draft"
                      ? "draft"
                      : "publish",
                )
              }
            >
              {publishMode === "schedule"
                ? "Schedule post"
                : publishMode === "draft"
                  ? "Save draft"
                  : "Publish now"}{" "}
              <LoadingSpinner
                show={
                  showLoading &&
                  (submittingMode === "publish" ||
                    submittingMode === "schedule" ||
                    submittingMode === "draft")
                }
              />
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${getPublicApiBase()}blog/${blogId}`}
        onSuccess={refreshBlogSitemap}
      />
      <ImageUrlPopup confirmBox={urlPopUp} setConfirmBox={setUrlPopUp} />

      {/* Blog preview drawer */}
      {previewBlog && (
        <BlogPreviewModal
          blog={previewBlog}
          onClose={() => setPreviewBlog(null)}
        />
      )}
    </>
  );
}
