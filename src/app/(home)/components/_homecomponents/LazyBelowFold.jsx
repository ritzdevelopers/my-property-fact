"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ChatbotV2 = dynamic(() => import("./ChatbotV2"), {
  ssr: false,
  loading: () => null,
});

// const ScrollToTop = dynamic(() => import("./ScrollToTop"), {
//   ssr: false,
//   loading: () => null,
// });

const LeadFormPopupTrigger = dynamic(() => import("./LeadFormPopupTrigger"), {
  ssr: false,
  loading: () => null,
});



function shouldHideGlobalFloatingUi(pathname) {
  if (!pathname || typeof pathname !== "string") return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/portal")) return true;
  return false;
}

export default function LazyBelowFold() {
  const pathname = usePathname();
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;
    const revealComponents = () => setIsIdle(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(revealComponents, { timeout: 2500 });
      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId);
        }
      };
    }

    timeoutId = window.setTimeout(revealComponents, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isIdle) {
    return null;
  }

  return (
    <>
      {/* <ScrollToTop /> */}
      <ChatbotV2 />
      <LeadFormPopupTrigger showOnHomeOnly showOnMobileOnly={false} />
    </>
  );
}
