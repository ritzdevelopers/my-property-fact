"use client";

import Link from "next/link";
import Script from "next/script";

export default function page() {
  return (
    <main
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f0fdf4" }}
    >
      <div className="text-center p-4">
        <h1 className="display-4 fw-bold text-success mb-4">Thank You!</h1>
        <p className="fs-5 text-secondary mb-4">
          Your message has been successfully submitted.
        </p>
        <Link
          title="Go back home"
          href="/landing-pages/onyx"
          className="btn btn-success btn-lg fw-semibold px-5 py-2"
        >
          Go back home
        </Link>
      </div>

      {/* Google Tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-11480562062"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-11480562062');
        `}
      </Script>
      <Script id="gtag-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': 'AW-11480562062/39UhCKj1h_YaEI7zreIq'
          });
        `}
      </Script>

      {/* Taboola Pixel */}
      <Script id="taboola-pixel" strategy="afterInteractive">
        {`
          window._tfa = window._tfa || [];
          window._tfa.push({notify: 'event', name: 'page_view', id: 1861501});
          !function (t, f, a, x) {
            if (!document.getElementById(x)) {
              t.async = 1;
              t.src = a;
              t.id = x;
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
    </main>
  );
}
