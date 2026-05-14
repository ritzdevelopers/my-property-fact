//components/Editor.js
"use client";

import React, { useEffect, useRef, useState } from "react";
// import JoditEditor from "jodit-react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
const Editor = ({ value, onChange }) => {
  const editor = useRef(null);
  const lastEmittedValue = useRef(null);
  const getJodit = () =>
    editor.current?.editor ||
    editor.current?.jodit ||
    editor.current;

  const escapeHTML = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const normalizeEditorValue = (text = "") =>
    text.replace(/\u2028/g, "\n").replace(/\u2029/g, "\n\n");

  const decodeHTMLEntities = (text) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    return doc.documentElement.textContent || "";
  };

  /**
   * When markup was stored or copied as entities (&lt;p&gt;… or &amp;lt;…),
   * the public site may show literal tags. Peel entity layers until real <tags>
   * remain (browser-only; editor is client-only).
   */
  const decodeEntityEncodedMarkupLayers = (text) => {
    if (typeof text !== "string" || !text) return text;
    if (typeof document === "undefined") return text;

    let out = text;
    for (let i = 0; i < 5; i += 1) {
      const stillEncoded =
        /&lt;\/?[a-z]/i.test(out) || /&(amp;)+lt;/i.test(out);
      if (!stillEncoded) break;

      const ta = document.createElement("textarea");
      ta.innerHTML = out;
      const next = ta.value;
      if (next === out) break;
      out = next;
    }

    return out;
  };

  const cleanHTML = (html = "") => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      decodeEntityEncodedMarkupLayers(html),
      "text/html",
    );

    doc.body.querySelectorAll("*").forEach((el) => {
      el.removeAttribute("style");
      el.removeAttribute("class");

      if (
        el.tagName.toLowerCase() === "span" &&
        el.attributes.length === 0
      ) {
        el.replaceWith(...el.childNodes);
      }
    });

    return doc.body.innerHTML;
  };

  const normalizeHTMLValue = (text = "") => {
    if (!text) return "";

    let normalizedValue = normalizeEditorValue(text);
    normalizedValue = decodeEntityEncodedMarkupLayers(normalizedValue);

    const hasEncodedHTMLTags = /&lt;\/?[a-z][\s\S]*?&gt;/i.test(normalizedValue);

    if (hasEncodedHTMLTags) {
      return cleanHTML(decodeHTMLEntities(normalizedValue));
    }

    return normalizedValue;
  };

  const [editorValue, setEditorValue] = useState(() => normalizeHTMLValue(value));

  useEffect(() => {
    if (value === lastEmittedValue.current) return;

    const normalized = normalizeHTMLValue(value);
    setEditorValue(normalized);

    // If the incoming value was entity-encoded (e.g. `&lt;p&gt;...`),
    // immediately push the decoded HTML back to the parent so a "save
    // without editing" still persists clean HTML (otherwise the public
    // site shows literal <tags> as text).
    if (typeof value === "string" && normalized !== value) {
      lastEmittedValue.current = normalized;
      onChange?.(normalized);
    }
  }, [value]);

  const handleEditorChange = (content) => {
    const normalizedContent = normalizeHTMLValue(content);

    lastEmittedValue.current = normalizedContent;
    onChange?.(normalizedContent);
  };

  const syncEditorChange = (jodit) => {
    const normalizedContent = normalizeHTMLValue(jodit.value);

    setEditorValue(normalizedContent);
    lastEmittedValue.current = normalizedContent;
    onChange?.(normalizedContent);
  };

  const createHTMLFragment = (jodit, html) => {
    const doc = jodit?.editorDocument || document;
    const template = doc.createElement("template");
    template.innerHTML = html;

    return template.content;
  };

  const insertHTMLAtCursor = (jodit, html) => {
    const selection = jodit?.editorWindow?.getSelection?.();

    if (!selection?.rangeCount) {
      jodit.s.insertHTML(html);
      return;
    }

    const range = selection.getRangeAt(0);
    const editorRoot = jodit.editor;
    const startElement =
      range.startContainer.nodeType === 1
        ? range.startContainer
        : range.startContainer.parentElement;
    const currentParagraph = startElement?.closest?.("p");
    const hasBlockTag = /<(h[1-6]|p|div|ul|ol|li|blockquote|table|section|article)\b/i.test(html);
    const fragment = hasBlockTag
      ? createHTMLFragment(jodit, html)
      : range.createContextualFragment(html);
    const lastNode = fragment.lastChild;

    if (
      hasBlockTag &&
      currentParagraph &&
      editorRoot?.contains(currentParagraph)
    ) {
      range.deleteContents();
      currentParagraph.parentNode.insertBefore(fragment, currentParagraph.nextSibling);

      if (!currentParagraph.textContent.trim()) {
        currentParagraph.remove();
      }

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return;
    }

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const config = {
    readonly: false,
    toolbar: true,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_as_html",
    cleanHTML: {
      removeAttributes: ["style", "class"], // remove inline styles & classes
      fillEmptyParagraph: false,
      removeEmptyElements: false,
    },
    events: {
      beforePaste: (event) => {
        if (!event?.clipboardData) return;
        const jodit = getJodit();
        const html = event.clipboardData.getData("text/html");
        const clipboardText = event.clipboardData.getData("text/plain");

        if (!jodit?.s) return;
        if (clipboardText) {
          const decodedText = decodeHTMLEntities(clipboardText);
          const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(decodedText);

          if (hasHTMLTags) {
            event.preventDefault();
            insertHTMLAtCursor(jodit, cleanHTML(decodedText));
            setTimeout(() => syncEditorChange(jodit), 0);
            return;
          }
        }

        if (html) {
          event.preventDefault();
          insertHTMLAtCursor(jodit, cleanHTML(html));
          setTimeout(() => syncEditorChange(jodit), 0);
          return;
        }

        if (clipboardText) {
          event.preventDefault();
          insertHTMLAtCursor(
            jodit,
            escapeHTML(clipboardText).replace(/\r\n/g, "\n").replace(/\n/g, "<br>")
          );
          setTimeout(() => syncEditorChange(jodit), 0);
        }
      },
    },
  };

  return (
    <JoditEditor
      ref={editor}
      value={editorValue}
      config={config}
      onBlur={handleEditorChange}
    />
  );
};

export default Editor;




// // components/Editor.js
// "use client";

// import React, { useRef } from "react";
// import JoditEditor from "jodit-react";

// const Editor = ({ value, onChange }) => {
//   const editor = useRef(null);
//   const getJodit = () =>
//     editor.current?.editor ||
//     editor.current?.jodit ||
//     editor.current;

//   const config = {
//     readonly: false,
//     toolbar: true,
//     cleanHTML: {
//       removeAttributes: ["style", "class"], // remove inline styles & classes
//       fillEmptyParagraph: false,
//       removeEmptyElements: false,
//     },
//     events: {
//       beforePaste: (event) => {
//         if (!event?.clipboardData) return;
//         const jodit = getJodit();
//         const html = event.clipboardData.getData("text/html");
//         const plainText = event.clipboardData.getData("text/plain");

//         if (!jodit?.s) return;
//         if (html) {
//           const parser = new DOMParser();
//           const doc = parser.parseFromString(html, "text/html");

//           // Remove inline styles, classes, and extra span tags
//           doc.querySelectorAll("*").forEach((el) => {
//             el.removeAttribute("style");
//             el.removeAttribute("class");
//             if (
//               el.tagName.toLowerCase() === "span" &&
//               el.attributes.length === 0
//             ) {
//               el.replaceWith(...el.childNodes);
//             }
//           });

//           event.preventDefault();
//           jodit.s.insertHTML(doc.body.innerHTML);
//           return;
//         }

//         if (plainText) {
//           event.preventDefault();
//           jodit.s.insertHTML(plainText);
//         }
//       },
//     },
//   };

//   return (
//     <JoditEditor
//       ref={editor}
//       value={value}
//       config={config}
//       onBlur={(newContent) => onChange(newContent)}
//     />
//   );
// };

// export default Editor;

