"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light text-center">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <p className="fs-4 text-secondary">Oops! Page not found</p>
      <p className="text-muted">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link title="Go Back Home" href="/" className="btn btn-primary mt-3">
        Go Back Home
      </Link>
    </div>
  );
}
