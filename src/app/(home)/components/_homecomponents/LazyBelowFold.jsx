"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isHomeGatewayRevealDone,
  MPF_GATEWAY_HIDDEN_EVENT,
} from "../../../_global_components/mpfGatewayEvents";

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
  const isHome = pathname === "/";
  const [isIdle, setIsIdle] = useState(false);
  /** Defer chatbot / enquire until home entry loader finishes (same as promo). */
  const [gatewayRevealDone, setGatewayRevealDone] = useState(() => !isHome);
  const landing_pages_links = [
    "/eldeco-echoes-of-eden",
    "/eldeco-echoes-of-eden/thankyou",
    "/Eldeco-terra&sol",
    "/Eldeco-terra&sol/thankyou",
    "/Eldeco-terra%26sol",
    "/Eldeco-terra%26sol/thankyou",
    "/lavidabella",
    "/lavidabella/thankyou",
    "/subh-anandam",
    "/subh-anandam/thankyou",
    "/landing-pages/brook-fusion",
    "/landing-pages/dholera",
    "/landing-pages/dholera/thankyou",
    "/landing-pages/eldeco-7-peaks",
    "/landing-pages/eldeco-camelot",
    "/landing-pages/eldeco-camelot/thankyou",
    "/landing-pages/eldeco-la-vida-bella2",
    "/landing-pages/eldeco-la-vida-bella2/thankyou",
    "/landing-pages/eldeco-la-vida-bella3",
    "/landing-pages/eldeco-la-vida-bella3/thankyou",
    "/landing-pages/eldeco-la-vida-bella3",
    "/landing-pages/eldeco-whispers-of-wonder",
    "/landing-pages/eldeco-whispers-of-wonder/thankyou",
    "/landing-pages/eldeco-wow",
    "/landing-pages/eldeco-wow/thankyou",
    "/landing-pages/onyx",
    "/landing-pages/onyx/thankyou",
    "/landing-pages/sikka-kimaya",
    "/landing-pages/sikka-kimaya/thankyou",
  ];
  const current_path_name = usePathname();
  const [is_landing_page, setIsLandingPage] = useState(false);
  useEffect(() => {
    if (landing_pages_links.includes(current_path_name)) {
      setIsLandingPage(true);
    } else {
      setIsLandingPage(false);
    }
  }, [current_path_name]);

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

  useEffect(() => {
    if (!isHome) {
      setGatewayRevealDone(true);
      return undefined;
    }
    const sync = () => {
      if (isHomeGatewayRevealDone()) setGatewayRevealDone(true);
    };
    sync();
    const onHidden = () => setGatewayRevealDone(true);
    window.addEventListener(MPF_GATEWAY_HIDDEN_EVENT, onHidden);
    return () => window.removeEventListener(MPF_GATEWAY_HIDDEN_EVENT, onHidden);
  }, [isHome]);

  useLayoutEffect(() => {
    if (!isHome) return undefined;

    const HIDE = "mpf-hide-home-fabs";
    const mq = window.matchMedia("(max-width: 767.98px)");
    const root = document.documentElement;

    const sync = () => {
      if (!mq.matches) {
        root.classList.remove(HIDE);
        return;
      }
      const hero = document.getElementById("mpf-home-hero");
      if (!hero) {
        root.classList.remove(HIDE);
        return;
      }
      const pastHero = hero.getBoundingClientRect().bottom <= 96;
      root.classList.toggle(HIDE, !pastHero);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    mq.addEventListener("change", sync);
    return () => {
      root.classList.remove(HIDE);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      mq.removeEventListener("change", sync);
    };
  }, [isHome]);

  if (shouldHideGlobalFloatingUi(pathname)) return null;

  if (!isIdle || !gatewayRevealDone) {
    return null;
  }

  return (
    <>
      {/* <ScrollToTop /> */}
      {is_landing_page ? null : <ChatbotV2 />}
      <LeadFormPopupTrigger showOnHomeOnly showOnMobileOnly={false} />
    </>
  );
}
