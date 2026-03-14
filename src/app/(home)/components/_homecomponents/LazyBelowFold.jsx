"use client";

import dynamic from "next/dynamic";

const ChatbotV2 = dynamic(() => import("./ChatbotV2"), {
  ssr: false,
  loading: () => null,
});

const ScrollToTop = dynamic(() => import("./ScrollToTop"), {
  ssr: false,
  loading: () => null,
});

const LeadFormPopupTrigger = dynamic(() => import("./LeadFormPopupTrigger"), {
  ssr: false,
  loading: () => null,
});

export default function LazyBelowFold() {
  return (
    <>
      <ScrollToTop />
      <ChatbotV2 />
      <LeadFormPopupTrigger showOnHomeOnly showOnMobileOnly={false} />
    </>
  );
}
