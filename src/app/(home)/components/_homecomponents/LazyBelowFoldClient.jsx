"use client";

import dynamic from "next/dynamic";

const LazyBelowFold = dynamic(() => import("./LazyBelowFold"), {
  ssr: false,
  loading: () => null,
});

export default function LazyBelowFoldClient() {
  return <LazyBelowFold />;
}
