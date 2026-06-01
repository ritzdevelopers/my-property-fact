import "./globals.css";
import "./styles/style.css";
import Script from "next/script";

export const metadata = {
  title: "Eldeco",
  description: "Eldeco Realty Landing Page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/favicon.png" />
      </head>
      <body suppressHydrationWarning>
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-16457709652"
        />
        <Script id="gtag-config" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-16457709652');`}
        </Script>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"
          integrity="sha512-NcZdtrT77bJr4STcmsGAESr06BYGE8woZdSdEgqnpyqac7sugNO+Tr4bGwGF3MsnEkGKhU2KL2xh6Ec+BqsaHA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"
          integrity="sha512-P2IDYZfqSwjcSjX0BKeNhwRUH8zRPGlgcWl5n6gBLzdi4Y5/0O4zaXrtO4K9TZK6Hn1BenYpKowuCavNandERg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}

