/** MPF sales WhatsApp. */
export const MPF_WHATSAPP_E164 = "918920024793";

export function getProjectSlug(project) {
  return String(project?.slugURL || project?.slugUrl || project?.slug || "")
    .trim()
    .replace(/^\/+/, "");
}

/** Matches `CommonPopUpform` project link rules for Project Detail. */
export function buildProjectDetailPublicUrl(projectDetail, pathname) {
  const base = String(
    process.env.NEXT_PUBLIC_UI_URL ||
      process.env.NEXT_PUBLIC_ROOT_URL ||
      "",
  ).replace(/\/$/, "");
  const slug = getProjectSlug(projectDetail);
  if (slug) return `${base}/${slug}`;
  const path = pathname
    ? pathname.startsWith("/")
      ? pathname
      : `/${pathname}`
    : "";
  return path ? `${base}${path}` : base;
}

export function buildExpertAdviceWhatsAppMessage(projectDetail, pathname) {
  const name = projectDetail?.projectName || "a project";
  const url = buildProjectDetailPublicUrl(projectDetail, pathname);
  return `Hi, I'm interested in ${name} and would like expert property advice. Project link: ${url}`;
}

export function buildExpertAdviceWhatsAppUrl(projectDetail, pathname) {
  return `https://wa.me/${MPF_WHATSAPP_E164}?text=${encodeURIComponent(
    buildExpertAdviceWhatsAppMessage(projectDetail, pathname),
  )}`;
}

let expertAdviceWhatsAppOpening = false;

/** Reset single-flight guard when the expert-advice modal closes. */
export function resetExpertAdviceWhatsAppOpenGuard() {
  expertAdviceWhatsAppOpening = false;
}

/**
 * Open WhatsApp in one new tab. With `noopener,noreferrer`, `window.open` often
 * returns `null` even when the tab opens — never call `location.assign` in that case.
 */
export function openExpertAdviceWhatsApp(projectDetail, pathname) {
  if (expertAdviceWhatsAppOpening) return;
  expertAdviceWhatsAppOpening = true;

  const whatsappUrl = buildExpertAdviceWhatsAppUrl(projectDetail, pathname);
  const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  if (popup != null) {
    try {
      popup.opener = null;
    } catch {
      /* ignore */
    }
    return;
  }

  // Popup blockers: open without noopener so we can detect failure, then detach opener.
  const fallback = window.open(whatsappUrl, "_blank");
  if (fallback != null) {
    try {
      fallback.opener = null;
    } catch {
      /* ignore */
    }
  }
}

export function getProjectPropertyId(project) {
  const id = Number(project?.id);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}
