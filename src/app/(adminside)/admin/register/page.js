import { redirect } from "next/navigation";

/** Public self-registration is disabled; Super Admin creates users from Manage Users. */
export default function AdminRegisterPage() {
  redirect("/admin");
}
