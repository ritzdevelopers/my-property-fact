"use client";

import Link from "next/link";
import Script from "next/script";

export default function ThankYouPage() {
  return (
    <>
      {/* Taboola Pixel Script */}
      <Script id="taboola-pixel" strategy="afterInteractive">
        {`
          window._tfa = window._tfa || [];
          window._tfa.push({notify: 'event', name: 'page_view', id: 1861501});
          !function (t, f, a, x) {
            if (!document.getElementById(x)) {
              t.async = 1; t.src = a; t.id = x;
              f.parentNode.insertBefore(t, f);
            }
          }(
            document.createElement('script'),
            document.getElementsByTagName('script')[0],
            '//cdn.taboola.com/libtrc/unip/1861501/tfa.js',
            'tb_tfa_script'
          );
        `}
      </Script>
      <main className="min-h-screen bg-white flex flex-col">
        <nav className="sticky top-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">


          </div>
        </nav>

        <section className="flex-grow flex items-center justify-center px-6 py-20">
          <div className="max-w-[600px] text-center rounded-3xl shadow-md p-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Thank You!
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              We appreciate your submission. Our team will get back to you shortly.
            </p>
            <Link
              href="/promotional-pages/eldeco-la-vida-bella"
              aria-label="Back to Home"
            >
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

