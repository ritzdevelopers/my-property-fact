import { Suspense } from "react";
import AccountPageClient from "./AccountPageClient";

export const metadata = {
  title: "My activity | My Property Fact",
  description: "See properties you have viewed and shortlisted on My Property Fact.",
};

export default function AccountPage() {
  return (
    <Suspense fallback={<main className="mpf-account-page" />}>
      <AccountPageClient />
    </Suspense>
  );
}
