import Script from "next/script";

const CONVERSION_SEND_TO = "AW-17892647835/R2h7CIDYta0cEJvH8NNC";

/** Conversion only — base gtag is loaded in ../layout.jsx */
export default function EldecoThankYouLayout({ children }) {
  return (
    <>
      <Script
        id="eldeco-thankyou-gtag-conversion"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('event', 'conversion', { 'send_to': '${CONVERSION_SEND_TO}' });
          `,
        }}
      />
      {children}
    </>
  );
}
