import {
  faBookOpen,
  faCircleCheck,
  faCircleExclamation,
  faClock,
  faFolderOpen,
  faImage,
  faImages,
  faLayerGroup,
  faPenToSquare,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

export const BLOG_STATUS_FILTERS = [
  { id: "all", label: "Total blogs", shortLabel: "Total", icon: faBookOpen, tone: "neutral" },
  { id: "active", label: "Active blogs", shortLabel: "Active", icon: faCircleCheck, tone: "success" },
  { id: "inactive", label: "Inactive blogs", shortLabel: "Inactive", icon: faBan, tone: "danger" },
];

export const WEB_STORY_STATUS_FILTERS = [
  { id: "all", label: "All stories", shortLabel: "All", icon: faImages, tone: "neutral" },
  { id: "with-image", label: "Stories with image", shortLabel: "With image", icon: faImage, tone: "success" },
  { id: "missing-image", label: "Stories missing image", shortLabel: "No image", icon: faCircleExclamation, tone: "danger" },
  { id: "with-description", label: "Stories with description", shortLabel: "Has text", icon: faBookOpen, tone: "info" },
  { id: "missing-description", label: "Stories missing description", shortLabel: "No text", icon: faPenToSquare, tone: "warning" },
];

export const BLOG_CATEGORY_FILTERS = [
  { id: "all", label: "All categories", shortLabel: "All", icon: faLayerGroup, tone: "neutral" },
  { id: "with-description", label: "Categories with description", shortLabel: "Described", icon: faBookOpen, tone: "success" },
  { id: "empty-description", label: "Categories missing description", shortLabel: "No desc.", icon: faCircleExclamation, tone: "warning" },
];

export const WEB_STORY_CATEGORY_FILTERS = [
  { id: "all", label: "All categories", shortLabel: "All", icon: faFolderOpen, tone: "neutral" },
  { id: "with-stories", label: "Categories with stories", shortLabel: "Has stories", icon: faImages, tone: "success" },
  { id: "empty", label: "Empty categories", shortLabel: "Empty", icon: faClock, tone: "warning" },
];

export function hasText(value) {
  return value != null && String(value).trim().length > 0;
}

export function hasImageFile(value) {
  return value != null && String(value).trim().length > 0;
}

export function isBlogActive(blog) {
  if (blog?.status === undefined || blog?.status === null) return true;
  return Number(blog.status) === 1;
}

/** @deprecated use isBlogActive */
export function isBlogPublished(blog) {
  return isBlogActive(blog);
}

export function getBlogRowMeta(blog) {
  return { active: isBlogActive(blog) };
}

export function getWebStoryRowMeta(story) {
  const hasImage = hasImageFile(story?.storyImage);
  const hasDescription = hasText(story?.storyDescription);
  return { hasImage, hasDescription };
}

export function filterBlogs(list, statusFilter) {
  const rows = Array.isArray(list) ? list : [];
  if (!statusFilter || statusFilter === "all") return rows;

  return rows.filter((blog) => {
    const active = isBlogActive(blog);
    if (statusFilter === "active") return active;
    if (statusFilter === "inactive") return !active;
    return true;
  });
}

export function countBlogs(list) {
  const rows = Array.isArray(list) ? list : [];
  return {
    all: rows.length,
    active: rows.filter((b) => isBlogActive(b)).length,
    inactive: rows.filter((b) => !isBlogActive(b)).length,
  };
}

export function getBlogRowClassName(row) {
  return isBlogActive(row) ? "mu-row--active" : "mu-row--disabled";
}

export function filterWebStories(list, statusFilter) {
  const rows = Array.isArray(list) ? list : [];
  if (!statusFilter || statusFilter === "all") return rows;

  return rows.filter((story) => {
    const { hasImage, hasDescription } = getWebStoryRowMeta(story);
    if (statusFilter === "with-image") return hasImage;
    if (statusFilter === "missing-image") return !hasImage;
    if (statusFilter === "with-description") return hasDescription;
    if (statusFilter === "missing-description") return !hasDescription;
    return true;
  });
}

export function countWebStories(list) {
  const rows = Array.isArray(list) ? list : [];
  return {
    all: rows.length,
    "with-image": rows.filter((s) => hasImageFile(s?.storyImage)).length,
    "missing-image": rows.filter((s) => !hasImageFile(s?.storyImage)).length,
    "with-description": rows.filter((s) => hasText(s?.storyDescription)).length,
    "missing-description": rows.filter((s) => !hasText(s?.storyDescription)).length,
  };
}

export function getWebStoryRowClassName(row) {
  const { hasImage, hasDescription } = getWebStoryRowMeta(row);
  if (!hasImage) return "mu-row--disabled";
  if (!hasDescription) return "mu-row--unverified";
  return "mu-row--active";
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

export function filterWebStoryCategories(list, statusFilter) {
  const rows = Array.isArray(list) ? list : [];
  if (!statusFilter || statusFilter === "all") return rows;
  return rows.filter((item) => {
    const count = Number(item?.noOfStories ?? 0);
    if (statusFilter === "with-stories") return count > 0;
    if (statusFilter === "empty") return count <= 0;
    return true;
  });
}

export function countWebStoryCategories(list) {
  const rows = Array.isArray(list) ? list : [];
  return {
    all: rows.length,
    "with-stories": rows.filter((item) => Number(item?.noOfStories ?? 0) > 0).length,
    empty: rows.filter((item) => Number(item?.noOfStories ?? 0) <= 0).length,
  };
}

export function getWebStoryCategoryRowClassName(row) {
  return Number(row?.noOfStories ?? 0) > 0 ? "mu-row--active" : "mu-row--pending";
}
