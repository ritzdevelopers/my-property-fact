import "bootstrap/dist/css/bootstrap.min.css";
import "./admin-globals.css";
import "./admin-auth.css";
import "./dashboard/admin-buttons-v2.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
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
  return <div className={poppins.className}>{children}</div>;
}
