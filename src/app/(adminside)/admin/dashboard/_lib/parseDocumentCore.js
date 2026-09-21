import mammoth from "mammoth";

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".docx", ".txt", ".html", ".htm"];
export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
export const DOCUMENT_SEPARATOR_RE = /^-{3,}$|^\*{3,}$|^_{3,}$/;

export const UNSUPPORTED_DOCUMENT_ERROR =
  "Unsupported file type. Please upload a .docx, .html, .htm, or .txt document.";

function getFileExtension(fileName) {
  const match = String(fileName || "").toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : "";
}

export function isAcceptedDocument(file, extensions = ACCEPTED_DOCUMENT_EXTENSIONS) {
  if (!file) return false;
  return extensions.includes(getFileExtension(file.name));
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function htmlToPlainText(html) {
  return decodeHtmlEntities(
    String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\r\n/g, "\n"),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function parseDocumentMetadataLines(lines, metadataPatterns) {
  const metadata = {};
  let index = 0;

  while (index < lines.length) {
    const line = String(lines[index] || "").trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (DOCUMENT_SEPARATOR_RE.test(line)) {
      index += 1;
      break;
    }

    let matched = false;
    for (const { key, re } of metadataPatterns) {
      const match = line.match(re);
      if (match) {
        metadata[key] = match[1].trim();
        matched = true;
        break;
      }
    }

    if (!matched) break;
    index += 1;
  }

  return { metadata, contentStartIndex: index };
}

export function stripLeadingDocumentMetadataFromHtml(html, metadataPatterns) {
  let remaining = String(html || "").trim();
  const blockRe = /^<(p|h[1-6]|div)[^>]*>([\s\S]*?)<\/\1>\s*/i;

  while (remaining) {
    const match = remaining.match(blockRe);
    if (!match) break;

    const innerText = htmlToPlainText(match[0]).trim();
    if (!innerText) {
      remaining = remaining.slice(match[0].length).trim();
      continue;
    }

    if (DOCUMENT_SEPARATOR_RE.test(innerText)) {
      remaining = remaining.slice(match[0].length).trim();
      break;
    }

    const isMetadata = metadataPatterns.some(({ re }) => re.test(innerText));
    if (isMetadata) {
      remaining = remaining.slice(match[0].length).trim();
      continue;
    }

    break;
  }

  return remaining;
}

export function extractFirstHeadingText(html) {
  const match = String(html || "").match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
  return match ? htmlToPlainText(match[1]).trim() : "";
}

export function extractFirstParagraphText(html) {
  const match = String(html || "").match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return match ? htmlToPlainText(match[1]).trim() : "";
}

export function sanitizeImportedHtml(html) {
  return String(html || "")
    .replace(/<img[^>]*>/gi, "")
    .trim();
}

async function parseDocxRawFields(file, metadataPatterns, contentFieldKey) {
  const arrayBuffer = await file.arrayBuffer();
  const [htmlResult, textResult] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }),
    mammoth.extractRawText({ arrayBuffer }),
  ]);

  const rawText = String(textResult.value || "").trim();
  if (!rawText) {
    throw new Error("The document appears to be empty.");
  }

  const { metadata } = parseDocumentMetadataLines(
    rawText.split(/\r?\n/),
    metadataPatterns,
  );
  const content = sanitizeImportedHtml(
    stripLeadingDocumentMetadataFromHtml(htmlResult.value || "", metadataPatterns),
  );

  return {
    ...metadata,
    [contentFieldKey]: content,
  };
}

function parseHtmlRawFields(htmlText, metadataPatterns, contentFieldKey) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(htmlText || ""), "text/html");
  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Could not parse the HTML document.");
  }

  const titleFromTag = doc.querySelector("title")?.textContent?.trim() || "";
  const metaDescription =
    doc.querySelector('meta[name="description" i]')?.getAttribute("content")?.trim() || "";
  const metaKeywords =
    doc.querySelector('meta[name="keywords" i]')?.getAttribute("content")?.trim() || "";

  const bodyHtml = doc.body?.innerHTML?.trim() || String(htmlText || "").trim();
  const plainLines = htmlToPlainText(bodyHtml).split(/\r?\n/);
  const { metadata, contentStartIndex } = parseDocumentMetadataLines(
    plainLines,
    metadataPatterns,
  );

  let content = sanitizeImportedHtml(
    stripLeadingDocumentMetadataFromHtml(bodyHtml, metadataPatterns),
  );
  if (contentStartIndex > 0) {
    const contentLines = plainLines.slice(contentStartIndex).join("\n").trim();
    if (contentLines && htmlToPlainText(content).trim() === "") {
      content = contentLines
        .split(/\n{2,}/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
        .join("\n");
    }
  }

  const merged = { ...metadata, [contentFieldKey]: content };
  if (!merged.metaTitle && titleFromTag) merged.metaTitle = titleFromTag;
  if (!merged.metaDescription && metaDescription) merged.metaDescription = metaDescription;
  if (!merged.metaKeywords && metaKeywords) merged.metaKeywords = metaKeywords;
  if (!merged.blogTitle && titleFromTag) merged.blogTitle = titleFromTag;
  if (!merged.blogMetaDescription && metaDescription) {
    merged.blogMetaDescription = metaDescription;
  }
  if (!merged.blogKeywords && metaKeywords) merged.blogKeywords = metaKeywords;

  return merged;
}

function parseTxtRawFields(text, metadataPatterns, contentFieldKey) {
  const lines = String(text || "").split(/\r?\n/);
  const { metadata, contentStartIndex } = parseDocumentMetadataLines(
    lines,
    metadataPatterns,
  );
  const bodyLines = lines.slice(contentStartIndex);

  const htmlParts = [];
  let listOpen = false;
  let listType = "ul";

  const closeList = () => {
    if (listOpen) {
      htmlParts.push(`</${listType}>`);
      listOpen = false;
    }
  };

  for (const line of bodyLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      htmlParts.push("<p><br></p>");
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${escapeHtml(headingMatch[2])}</h${level}>`);
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      if (!listOpen || listType !== "ul") {
        closeList();
        htmlParts.push("<ul>");
        listOpen = true;
        listType = "ul";
      }
      htmlParts.push(`<li>${escapeHtml(bulletMatch[1])}</li>`);
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (!listOpen || listType !== "ol") {
        closeList();
        htmlParts.push("<ol>");
        listOpen = true;
        listType = "ol";
      }
      htmlParts.push(`<li>${escapeHtml(numberedMatch[1])}</li>`);
      continue;
    }

    closeList();
    htmlParts.push(`<p>${escapeHtml(trimmed)}</p>`);
  }

  closeList();

  return {
    ...metadata,
    [contentFieldKey]: htmlParts.join("\n").trim(),
  };
}

export async function parseDocumentToRawFields(
  file,
  metadataPatterns,
  contentFieldKey = "content",
) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!isAcceptedDocument(file)) {
    throw new Error(UNSUPPORTED_DOCUMENT_ERROR);
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("The document is too large. Maximum supported size is 15 MB.");
  }

  const ext = getFileExtension(file.name);

  if (ext === ".docx") {
    return parseDocxRawFields(file, metadataPatterns, contentFieldKey);
  }
  if (ext === ".html" || ext === ".htm") {
    const htmlText = await file.text();
    return parseHtmlRawFields(htmlText, metadataPatterns, contentFieldKey);
  }
  if (ext === ".txt") {
    const text = await file.text();
    if (!String(text || "").trim()) {
      throw new Error("The document appears to be empty.");
    }
    return parseTxtRawFields(text, metadataPatterns, contentFieldKey);
  }

  throw new Error(UNSUPPORTED_DOCUMENT_ERROR);
}

export async function parseImportedDocument(
  file,
  {
    metadataPatterns,
    contentFieldKey = "content",
    finalize,
    recoverableErrorPattern = /empty|unsupported|too large|no .* content/i,
    parseFailureMessage = "Could not parse the document. Please check the file format and try again.",
  },
) {
  let parsed;

  try {
    parsed = await parseDocumentToRawFields(file, metadataPatterns, contentFieldKey);
  } catch (error) {
    if (error?.message && recoverableErrorPattern.test(error.message)) {
      throw error;
    }
    throw new Error(parseFailureMessage);
  }

  return finalize(parsed);
}
