"use client";

import { Spinner } from "react-bootstrap";

export function LoadingSpinner({ show, height }) {
  return show ? (
    <div style={{ height: height }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  ) : (
    ""
  );
}
