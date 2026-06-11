// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// // import logo from "../assets/BrookLogo.png"; // Update the path as needed
// import logo from "../assets/fusion-logo.webp"; // Update the path as needed

// export default function RightSidebar() {
//     const [isMenuOpen, setIsMenuOpen] = useState(false);
//     const [hasMounted, setHasMounted] = useState(false); // Prevent SSR mismatch

//     useEffect(() => {
//         setHasMounted(true);
//     }, []);

//     if (!hasMounted) return null; // Prevents mismatches during SSR

//     return (
//         <>
//             {/* Fixed Right Sidebar */}
//             <div
//                 className="d-none d-md-flex flex-column align-items-center position-fixed top-0 end-0 h-100 bg-white border-start shadow "
//                 style={{ width: "120px", zIndex: 10050, marginTop: 80 }}
//             >
//                 {/* Logo */}
//                 <div className="my-3">
//                     <img src={logo} alt="Logo" width={100} height={60} />
//                 </div>

//                 {/* Hamburger */}
//                 <button
//                     className="btn border-0 mt-auto mb-4"
//                     onClick={() => setIsMenuOpen(true)}
//                     aria-label="Open menu"
//                 >
//                     <span className="navbar-toggler-icon"></span>
//                 </button>
//             </div>

//             {/* Slide-in Menu */}
//             <div
//                 className={`slide-menu position-fixed top-0 h-100 bg-white shadow-lg d-none d-md-block ${isMenuOpen ? "show" : ""
//                     }`}
//                 style={{
//                     width: "250px",
//                     right: 0,
//                     zIndex: 1040,
//                 }}
//             >
//                 <div className="d-flex flex-column p-4 h-100">
//                     <div className="d-flex justify-content-between align-items-center mb-4">
//                         <h5 className="mb-0">Menu</h5>
//                         <button
//                             className="btn btn-close"
//                             onClick={() => setIsMenuOpen(false)}
//                             aria-label="Close menu"
//                         ></button>
//                     </div>

//                     <nav className="nav flex-column gap-3">
//                         <a className="nav-link text-dark" href="#home">Home</a>
//                         <a className="nav-link text-dark" href="#about">About</a>
//                         <a className="nav-link text-dark" href="#services">Services</a>
//                         <a className="nav-link text-dark" href="#contact">Contact</a>
//                     </nav>

//                     <div className="mt-auto pt-4 border-top">
//                         <p className="small text-muted">© 2026 Your Company</p>
//                     </div>
//                 </div>
//             </div>

//             <style jsx>{`
//                 .slide-menu {
//                     transform: translateX(100%);
//                     transition: transform 0.3s ease-in-out;
//                 }

//                 .slide-menu.show {
//                     transform: translateX(0%);
//                 }

//                 @media (max-width: 768px) {
//                     .d-md-block,
//                     .d-md-flex {
//                         display: none !important;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// }



"use client";

import { useState, useEffect } from "react";
import logo from "../assets/fusion-logo.webp"; // Adjust path as needed

export default function RightSidebar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasMounted, setHasMounted] = useState(false); // Prevent SSR mismatch

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return null;

    return (
        <>
            {/* Right Fixed Sidebar */}
            <div
                className="d-none d-md-flex flex-column align-items-center position-fixed top-0 end-0 h-100 bg-white border-start shadow"
                style={{ width: "120px", zIndex: 10050, marginTop: 80 }}
            >
                {/* Logo */}
                <div className="my-3">
                    <img src={logo} alt="Logo" width={100} height={60} />
                </div>

                {/* Hamburger Button */}
                <button
                    className="btn border-0 mt-auto mb-4"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Open menu"
                >
                    {/* Custom SVG Hamburger Icon (Black) */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="black"
                        className="bi bi-list"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M2.5 12.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11z"
                        />
                    </svg>
                </button>
            </div>

            {/* Slide-in Menu */}
            <div
                className={`slide-menu position-fixed top-0 h-100 bg-white shadow-lg d-none d-md-block ${isMenuOpen ? "show" : ""
                    }`}
                style={{
                    width: "250px",
                    right: 0,
                    zIndex: 1040,
                }}
            >
                <div className="d-flex flex-column p-4 h-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0">Menu</h5>
                        <button
                            className="btn btn-close"
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close menu"
                        ></button>
                    </div>

                    <nav className="nav flex-column gap-3">
                        <a className="nav-link text-dark" href="#home">Home</a>
                        <a className="nav-link text-dark" href="#about">About</a>
                        <a className="nav-link text-dark" href="#services">Services</a>
                        <a className="nav-link text-dark" href="#contact">Contact</a>
                    </nav>

                    <div className="mt-auto pt-4 border-top">
                        <p className="small text-muted">© 2026 Your Company</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slide-menu {
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                }

                .slide-menu.show {
                    transform: translateX(0%);
                }

                @media (max-width: 768px) {
                    .d-md-block,
                    .d-md-flex {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
