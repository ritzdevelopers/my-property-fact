import '../globals.css';
import { notFound } from 'next/navigation';
import { Montserrat, Open_Sans } from 'next/font/google';
import Script from 'next/script';
import TailwindCDN from '../TailwindCDN';

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

const VALID_NUMBER_MIN = 1;
const VALID_NUMBER_MAX = 8;

export default async function Layout({ children, params }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params;
  const number = resolvedParams?.number;
  const n = parseInt(number, 10);
  if (Number.isNaN(n) || n < VALID_NUMBER_MIN || n > VALID_NUMBER_MAX) {
    notFound();
  }
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
