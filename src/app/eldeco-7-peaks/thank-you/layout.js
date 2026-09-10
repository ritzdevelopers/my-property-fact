import Script from "next/script";

const GTAG_ID = "AW-17892647835";
const CONVERSION_SEND_TO = "AW-17892647835/zAr1CKPi3vIcEJvH8NNC";

export default function ThankYouLayout({ children }) {
  return (
    <>
      {children}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config-7peaks-thankyou" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GTAG_ID}');
        `}
      </Script>
      {/* Event snippet for Eldeco 7 peaks Submit lead form conversion page */}
      <Script id="gtag-conversion-7peaks-submit-lead" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': '${CONVERSION_SEND_TO}',
            'value': 1.0,
            'currency': 'INR'
          });
        `}
      </Script>
    </>
  );
}
