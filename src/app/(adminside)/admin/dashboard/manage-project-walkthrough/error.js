"use client";

import { useEffect } from "react";

export default function ManageProjectWalkthroughError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="my-5 text-center">
      <h4 className="text-danger">Something went wrong!</h4>
      <p className="text-muted">{error?.message}</p>
      <button
        onClick={() => reset()}
        className="btn btn-outline-primary mt-3"
      >
        Try again
      </button>
    </div>
  );
}
