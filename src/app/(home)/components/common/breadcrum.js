import Link from "next/link";

export default function CommonBreadCrum({ firstPage, pageName }) {
  return (
    <div className="container bg-light my-4 rounded border p-3">
      <ul className="d-flex flex-wrap text-decoration-none align-items-center list-unstyled gap-1 fw-bold ps-3 m-0">
        <li>
          <Link className="text-decoration-none text-dark" href="/" title="Home">
            Home
          </Link>
        </li>
        {firstPage && (
          <li>
            <Link
              className="text-decoration-none text-dark text-capitalize d-flex"
              href={`/${firstPage?.toLowerCase()}`}
              title={firstPage}
            >
              {'\\ ' + firstPage}
            </Link>
          </li>
        )}
        <li className="text-secondary text-break">{'\\ ' + pageName}</li>
      </ul>
    </div>
  );
}
