"use client";

import MpfTopPicks from "./mpfTopPick";

export default function TopPicksWithRotation({ initialProjects }) {
  return <MpfTopPicks topProjects={initialProjects ?? []} />;
}
