"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export default function ThankYouPage() {
  const router = useRouter();
  const params = useParams();
  const pathParam = params?.path || "1";
  const [countdown, setCountdown] = useState(7);
  const backUrl = `/landing-pages/eldeco-camelot/${pathParam}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(backUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, backUrl]);

  return (
    <div className="thankyou-page">
      {(pathParam === "4" ||
        pathParam === "5" ||
        pathParam === "6" ||
        pathParam === "7") && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=AW-17892647835"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-17892647835');
              `}
          </Script>
          <Script id="google-analytics-conversion" strategy="afterInteractive">
            {`
                gtag('event', 'conversion', {'send_to': 'AW-17892647835/c3iuCN2QoPUbEJvH8NNC'});
              `}
          </Script>
        </>
      )}
      {pathParam === "8" && (
        <Script
          id="taboola-pixel-eldeco-camelot-thankyou"
          strategy="afterInteractive"
        >
          {`
            window._tfa = window._tfa || [];
            window._tfa.push({ notify: 'event', name: 'page_view', id: 1723008 });
            !function (t, f, a, x) {
              if (!document.getElementById(x)) {
                t.async = 1; t.src = a; t.id = x; f.parentNode.insertBefore(t, f);
              }
            }(document.createElement('script'),
            document.getElementsByTagName('script')[0],
            '//cdn.taboola.com/libtrc/unip/1723008/tfa.js',
            'tb_tfa_script');
          `}
        </Script>
      )}
      <div className="thankyou-container">
        <div className="thankyou-icon">
          <FontAwesomeIcon icon={faCheck} />
        </div>

        <h1 className="thankyou-title">Thank You!</h1>
        <p className="thankyou-message">
          Your enquiry has been submitted successfully. Our team will get back
          to you shortly.
        </p>

        <div className="countdown-timer">
          <span>Redirecting back to Eldeco Camelot in </span>
          <span className="countdown-number">{countdown}</span>
          <span> seconds</span>
        </div>

        <Link href={backUrl} title="Back to Eldeco Camelot" className="home-button">
          <i className="fa-solid fa-arrow-left"></i>
          Back to Eldeco Camelot
        </Link>
      </div>

      <style jsx>{`
        body {
          font-family: "Open Sans", sans-serif;
          background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
          margin: 0;
          padding: 0;
        }

        .thankyou-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .thankyou-container {
          max-width: 600px;
          width: 100%;
          text-align: center;
          background: #ffffff;
          border-radius: 20px;
          padding: 3rem 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .thankyou-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #17693d, #0a4064);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          animation: scaleIn 0.5s ease-out;
        }

        .thankyou-icon i {
          font-size: 3rem;
          color: #fff;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .thankyou-title {
          font-family: "Montserrat", sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 1rem;
        }

        .thankyou-message {
          font-family: "Open Sans", sans-serif;
          font-size: 1.1rem;
          color: #666;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .countdown-timer {
          font-family: "Montserrat", sans-serif;
          font-size: 1.2rem;
          color: #17693d;
          font-weight: 600;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #f0f7f3;
          border-radius: 10px;
        }

        .countdown-number {
          font-size: 2rem;
          color: #17693d;
          font-weight: 700;
          display: inline-block;
          min-width: 40px;
        }

        .home-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          background: #17693d;
          color: #fff;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: "Open Sans", sans-serif;
        }

        .home-button:hover {
          background: #0d4d2a;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(23, 105, 61, 0.3);
        }

        @media (max-width: 768px) {
          .thankyou-container {
            padding: 2rem 1.5rem;
          }

          .thankyou-title {
            font-size: 2rem;
          }

          .thankyou-message {
            font-size: 1rem;
          }

          .countdown-timer {
            font-size: 1rem;
          }

          .countdown-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}