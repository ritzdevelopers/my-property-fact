import "./bootstrap-critical.css";
import "bootstrap/dist/css/bootstrap.min.css";
import dynamic from "next/dynamic";
import Link from "next/link";

const HeaderComponent = dynamic(
  () => import("./components/header/headerComponent").then((m) => m.default),
  {
    ssr: true,
    loading: () => (
      <header className="d-flex justify-content-between align-items-center px-2 px-lg-4 header" style={{ minHeight: 74 }}>
        <Link title="My Property Fact Home" href="/" aria-label="My Property Fact Home">
          <img loading="eager"
            src="/logo.webp"
            alt="My Property Fact — home"
            title="My Property Fact — home"
            width={80}
            height={74}
            fetchPriority="high"
          />
        </Link>
      </header>
    ),
  }
);

const NewFooterDesign = dynamic(
  () => import("./components/footer/NewFooterDesign").then((m) => m.default),
  { ssr: true, loading: () => <footer style={{ minHeight: 200 }} aria-busy="true" /> }
);

export const metadata = {
  title: "My Property Fact | Smarter Real Estate Decisions Start Here",
  description:
    "Explore flats, residential & commercial properties across India on MyPropertyFact: NCR, Delhi, Faridabad, Noida, & top Indian cities with verified listings and top developers.",
  keywords: [
    "real estate India" , 
    "property insights" , 
    "real estate trends" , 
    "investment property" , 
    "LOCATE score" , 
    "smart real estate decisions" , 
    "property investment tips" , 
    "real estate guide India", 
  ],
};

export default function RootLayout({ children }) {
  return (
    <>
      <HeaderComponent />
      {children}
      <NewFooterDesign />
    </>
  );
}
