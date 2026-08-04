import "bootstrap/dist/css/bootstrap.min.css";
import "./admin-globals.css";
import "./admin-auth.css";
import "./dashboard/admin-buttons-v2.css";
import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "MPF | Admin",
  description: "my-property-fact",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({ children }) {
  return <div className={nunitoSans.className}>{children}</div>;
}
