import Script from "next/script";

// Local CSS from this route's css/ and viewbox/ folders (bundled by Next.js)
import "./css/bootstrap.min.css";
import "./css/aos.css";
import "./css/owl.carousel.css";
import "./viewbox/viewbox.css";
import "./css/custom.css";
import "./css/responsive.css";

export const metadata = {
    title: "Eldeco",
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
};

// Base path for local JS/viewbox assets (must live in public/eldeco-la-vida-bella/)
const ASSETS = "/eldeco-la-vida-bella";

export default function Layout({ children }) {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font -- fonts intentional for this landing only */}
            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            <link
                rel="stylesheet"
                href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
            />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css"
            />

            {/* Local JS: load in order (jQuery → Bootstrap → Viewbox → Owl → SelectOrDie → Custom) */}
            <Script src={`${ASSETS}/viewbox/jquery-1.12.0.min.js`} strategy="afterInteractive" />
            <Script src={`${ASSETS}/js/bootstrap.min.js`} strategy="afterInteractive" />
            <Script src={`${ASSETS}/viewbox/jquery.viewbox.min.js`} strategy="afterInteractive" />
            <Script src={`${ASSETS}/js/owl.carousel.js`} strategy="afterInteractive" />
            <Script src={`${ASSETS}/js/selectordie.js`} strategy="afterInteractive" />
            <Script src={`${ASSETS}/js/custom.js`} strategy="afterInteractive" />

            {children}
        </>
    );
}
