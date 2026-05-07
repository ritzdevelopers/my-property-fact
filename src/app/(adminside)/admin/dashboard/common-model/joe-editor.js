// components/Editor.js
"use client";

import React, { useRef } from "react";
import JoditEditor from "jodit-react";

const Editor = ({ value, onChange }) => {
  const editor = useRef(null);
  const getJodit = () =>
    editor.current?.editor ||
    editor.current?.jodit ||
    editor.current;

  const config = {
    readonly: false,
    toolbar: true,
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
        const plainText = event.clipboardData.getData("text/plain");

        if (!jodit?.s) return;
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Remove inline styles, classes, and extra span tags
          doc.querySelectorAll("*").forEach((el) => {
            el.removeAttribute("style");
            el.removeAttribute("class");
            if (
              el.tagName.toLowerCase() === "span" &&
              el.attributes.length === 0
            ) {
              el.replaceWith(...el.childNodes);
            }
          });

          event.preventDefault();
          jodit.s.insertHTML(doc.body.innerHTML);
          return;
        }

        if (plainText) {
          event.preventDefault();
          jodit.s.insertHTML(plainText);
        }
      },
    },
  };

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      onBlur={(newContent) => onChange(newContent)}
    />
  );
};

export default Editor;
