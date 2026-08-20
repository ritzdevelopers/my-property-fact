import {
  faBookOpen,
  faCircleCheck,
  faCircleExclamation,
  faClock,
  faLayerGroup,
  faPenToSquare,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

export const BLOG_STATUS = {
  INACTIVE: 0,
  PUBLISHED: 1,
  DRAFT: 2,
  SCHEDULED: 3,
};

export const BLOG_STATUS_FILTERS = [
  { id: "all", label: "Total blogs", shortLabel: "Total", icon: faBookOpen, tone: "neutral" },
  { id: "published", label: "Published blogs", shortLabel: "Published", icon: faCircleCheck, tone: "success" },
  { id: "draft", label: "Draft blogs", shortLabel: "Drafts", icon: faPenToSquare, tone: "info" },
  { id: "scheduled", label: "Scheduled blogs", shortLabel: "Scheduled", icon: faClock, tone: "warning" },
  { id: "inactive", label: "Inactive blogs", shortLabel: "Inactive", icon: faBan, tone: "danger" },
];

export const BLOG_CATEGORY_FILTERS = [
  { id: "all", label: "All categories", shortLabel: "All", icon: faLayerGroup, tone: "neutral" },
  { id: "with-description", label: "Categories with description", shortLabel: "Described", icon: faBookOpen, tone: "success" },
  { id: "empty-description", label: "Categories missing description", shortLabel: "No desc.", icon: faCircleExclamation, tone: "warning" },
];

export function hasText(value) {
  return value != null && String(value).trim().length > 0;
}

export function getBlogPublicationState(blog) {
  const status = Number(blog?.status ?? BLOG_STATUS.PUBLISHED);
  if (status === BLOG_STATUS.DRAFT) return "draft";
  if (status === BLOG_STATUS.SCHEDULED) return "scheduled";
  if (status === BLOG_STATUS.PUBLISHED) return "published";
  return "inactive";
}

export function isBlogActive(blog) {
  return getBlogPublicationState(blog) === "published";
}

/** @deprecated use isBlogActive */
export function isBlogPublished(blog) {
  return isBlogActive(blog);
}

export function getBlogRowMeta(blog) {
  return { active: isBlogActive(blog), state: getBlogPublicationState(blog) };
}

export function getBlogStatusLabel(blog) {
  const state = getBlogPublicationState(blog);
  if (state === "draft") return "Draft";
  if (state === "scheduled") return "Scheduled";
  if (state === "published") return "Published";
  return "Inactive";
}

export function filterBlogs(list, statusFilter) {
  const rows = Array.isArray(list) ? list : [];
  if (!statusFilter || statusFilter === "all") return rows;

  return rows.filter((blog) => getBlogPublicationState(blog) === statusFilter);
}

export function countBlogs(list) {
  const rows = Array.isArray(list) ? list : [];
  return {
    all: rows.length,
    published: rows.filter((b) => getBlogPublicationState(b) === "published").length,
    draft: rows.filter((b) => getBlogPublicationState(b) === "draft").length,
    scheduled: rows.filter((b) => getBlogPublicationState(b) === "scheduled").length,
    inactive: rows.filter((b) => getBlogPublicationState(b) === "inactive").length,
  };
}

export function getBlogRowClassName(row) {
  const state = getBlogPublicationState(row);
  if (state === "draft") return "mu-row--unverified";
  if (state === "scheduled") return "mu-row--pending";
  if (state === "published") return "mu-row--active";
  return "mu-row--disabled";
}

export function filterBlogCategories(list, statusFilter) {
  const rows = Array.isArray(list) ? list : [];
  if (!statusFilter || statusFilter === "all") return rows;
  return rows.filter((item) => {
    const described = hasText(item?.categoryDescription);
    if (statusFilter === "with-description") return described;
    if (statusFilter === "empty-description") return !described;
    return true;
  });
}

export function countBlogCategories(list) {
  const rows = Array.isArray(list) ? list : [];
  return {
    all: rows.length,
    "with-description": rows.filter((item) => hasText(item?.categoryDescription)).length,
    "empty-description": rows.filter((item) => !hasText(item?.categoryDescription)).length,
  };
}

export function getBlogCategoryRowClassName(row) {
  return hasText(row?.categoryDescription) ? "mu-row--active" : "mu-row--unverified";
}
