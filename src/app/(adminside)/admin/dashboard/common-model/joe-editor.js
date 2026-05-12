"use client";

import React, { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";

const Editor = ({ value, onChange }) => {
  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: false,
    toolbar: true,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",
    processPasteHTML: true,
    cleanHTML: {
      removeAttributes: ["style", "class"], // remove inline styles & classes
      fillEmptyParagraph: false,
      removeEmptyElements: false,
    },
  }), []);

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      onBlur={(newContent) => onChange(newContent)}
      onChange={onChange}
    />
  );
};

export default Editor;
