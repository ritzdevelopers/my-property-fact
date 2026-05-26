"use client";

import Link from "next/link";
import Script from "next/script";

export default function ThankYouPage() {
  return (
    <>
      {/* Optional: Taboola Pixel */}
      {/* <Script id="taboola-pixel" strategy="afterInteractive">...</Script> */}

      <main className="min-h-screen bg-[#f9fafb] text-gray-800 flex flex-col" style={{ zIndex: 9000000 }}>
        {/* Header */}


        {/* Main Content */}
        <section className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-10 sm:p-12 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Thank You
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-10 leading-relaxed">
              We sincerely appreciate your submission. A member of our team will contact you shortly with the next steps.
            </p>




            <Link
              title="Back to Home"
              href="/promotional-pages/sikka-kimaya"
              className="btn px-4 py-2 mt-4 fw-semibold text-white"
              style={{
                backgroundColor: "#A8BF05",
                border: "1px solid #A8BF05",
                transition: "all 0.3s ease",
                fontSize: "1.125rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#A8BF05";
                e.currentTarget.style.borderColor = "#A8BF05";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#A8BF05";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#A8BF05";
              }}
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
