import './globals.css';
import { Montserrat, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import TailwindCDN from './TailwindCDN';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-opensans',
  display: 'swap',
});

export const metadata = {
  title: 'Eldeco | Oxy-Rich Luxury Residences',
  description: 'Oxy-Rich Luxury Residences by Eldeco - 3 & 4 BHK luxury residences in Greater Noida.',
};

export default function Layout({ children }) {
  return (
    <div className={`eldeco-7-peaks-layout ${openSans.variable} ${montserrat.variable} ${openSans.className}`}>
      <TailwindCDN />
      {children}
      {/* Google tag (gtag.js) - Eldeco conversion tracking */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17892647835"
        strategy="afterInteractive"
      />
      <Script id="gtag-eldeco" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'AW-17892647835');
        `}
      </Script>
    </div>
  );
}
