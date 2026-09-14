"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";

const ROTATE_MS = 5600;

function fromProject(project) {
  if (!project?.slugURL || !project?.projectName) return null;
  return {
    kind: "project",
    eyebrow: "Newly added",
    title: "Have a look on this property",
    href: `/${project.slugURL}`,
    at: Number(project.id) || 0,
    name: String(project.projectName).trim(),
  };
}

export default function HeaderLatestSpark() {
  const { projectList = [] } = useSiteData() || {};
  const [remoteItems, setRemoteItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/home/latest-spark")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        const next = Array.isArray(data?.items)
          ? data.items
              .filter((item) => item?.href)
              .map((item) =>
                item.kind === "blog"
                  ? {
                      ...item,
                      eyebrow: "Newly added",
                      title: "Have a look at this story",
                      name: item.name || item.title,
                    }
                  : {
                      ...item,
                      eyebrow: "Newly added",
                      title: "Have a look on this property",
                      name: item.name || item.title,
                    },
              )
          : [];
        setRemoteItems(next);
      })
      .catch(() => {
        if (!cancelled) setRemoteItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => {
    const merged = [...remoteItems];
    if (!merged.some((item) => item.kind === "project")) {
      const newest = [...projectList]
        .filter((project) => project?.slugURL && project?.projectName)
        .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0))[0];
      const extra = fromProject(newest);
      if (extra) merged.push(extra);
    }
    return merged;
  }, [remoteItems, projectList]);

  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const item = items[index] || items[0];
  if (!item) return null;

  return (
    <Link
      href={item.href}
      className="mpf-header-spark"
      title={item.name || item.title}
      aria-label={`${item.eyebrow}: ${item.name || item.title}`}
    >
      <span className="mpf-header-spark__aura" aria-hidden />
      <span className="mpf-header-spark__icon" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.4 13.7 8.3 19.6 10 13.7 11.7 12 17.6 10.3 11.7 4.4 10 10.3 8.3 12 2.4Z"
            fill="currentColor"
          />
          <path d="M18.2 14.2 19 16.6 21.4 17.4 19 18.2 18.2 20.6 17.4 18.2 15 17.4 17.4 16.6 18.2 14.2Z" fill="currentColor" />
        </svg>
      </span>
      <span className="mpf-header-spark__copy">
        <small>{item.eyebrow}</small>
        <strong>{item.title}</strong>
      </span>
    </Link>
  );
}
