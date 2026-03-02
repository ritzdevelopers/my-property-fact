import { Inter } from 'next/font/google';
import './globals.css';
import './portal-global.css';
import './_components/PortalCommonStyles.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import { UserProvider } from './_contexts/UserContext';
import SessionMonitor from '../admin/_components/SessionMonitor';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#667eea' },
  ],
};

// Preload critical CSS
export const metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Property Portal Dashboard - Real Estate Management System',
    template: '%s | Property Portal Dashboard'
  },
  description: 'Professional real estate portal dashboard for agents and property owners. Manage listings, leads, communications, analytics, and more with our comprehensive property management system.',
  keywords: [
    'real estate portal',
    'property management',
    'real estate dashboard',
    'property listings',
    'lead management',
    'real estate CRM',
    'property analytics',
    'real estate communication',
    'property portal',
    'real estate software',
    'property management system',
    'real estate agent tools',
    'property marketing',
    'real estate analytics',
    'property sales management',
    'real estate lead tracking',
    'property inventory management',
    'real estate reporting',
    'property portal dashboard',
    'real estate business management'
  ],
  authors: [{ name: 'Property Portal Team' }],
  creator: 'Property Portal',
  publisher: 'Property Portal',
  robots: {
    index: false, // Keep dashboard private from search engines
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com/portal',
    title: 'Property Portal Dashboard - Real Estate Management System',
    description: 'Professional real estate portal dashboard for agents and property owners. Manage listings, leads, communications, analytics, and more.',
    siteName: 'Property Portal',
    images: [
      {
        url: '/images/portal-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Property Portal Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Portal Dashboard - Real Estate Management System',
    description: 'Professional real estate portal dashboard for agents and property owners.',
    images: ['/images/portal-og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'real estate',
  classification: 'Business Software',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.webp', sizes: 'any', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#667eea',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function PortalLayout({ children }) {
  return (
    <UserProvider>
      <SessionMonitor />
      <div className="portal-body">
        <div id="portal-root">
          {children}
        </div>
      </div>
    </UserProvider>
  );
}
