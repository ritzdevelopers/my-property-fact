import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import { Geist, Geist_Mono } from "next/font/google";
import "./style.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eldeco La Vida Bella",
  description: "Eldeco La Vida Bella",
};

export default function RootLayout({ children }) {
  return (
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </div>
  );
}
