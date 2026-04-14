import { redirect } from "next/navigation";

export default function PendingAdminApprovalsRedirectPage() {
  redirect("/admin/dashboard/pending-permissions");
}
