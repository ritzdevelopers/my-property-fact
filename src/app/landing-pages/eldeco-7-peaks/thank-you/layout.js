import Script from 'next/script';

export const metadata = {
  title: 'Thank You | Eldeco | Oxy-Rich Luxury Residences',
  description: 'We have received your request. Our team will get back to you shortly.',
};

export default function ThankYouLayout({ children }) {
  return (
    <>
      {children}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17892647835"
        strategy="afterInteractive"
      />
      <Script id="gtag-thankyou" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'AW-17892647835');
          gtag('event', 'conversion', { 'send_to': 'AW-17892647835/o36fCL3qr_UbEJvH8NNC' });
        `}
      </Script>
    </>
  );
}
