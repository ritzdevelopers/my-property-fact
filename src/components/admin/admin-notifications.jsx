"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Bell, FileText, Home, Mail, ShieldAlert } from "lucide-react";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "@/app/(adminside)/admin/_contexts/AdminRoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "./admin-notifications.css";

const POLL_MS = 20000;
const STORAGE_KEY = "mpf_admin_notif_seen_at";

function authHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseOccurredAt(raw) {
  if (raw == null || raw === "") return null;
  if (Array.isArray(raw) && raw.length >= 3) {
    const y = Number(raw[0]);
    const mo = Number(raw[1]) - 1;
    const d = Number(raw[2]);
    const h = raw.length > 3 ? Number(raw[3]) : 0;
    const mi = raw.length > 4 ? Number(raw[4]) : 0;
    const s = raw.length > 5 ? Number(raw[5]) : 0;
    if ([y, mo, d, h, mi, s].some((x) => Number.isNaN(x))) return null;
    return new Date(y, mo, d, h, mi, s);
  }
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatRelativeTime(raw) {
  const dt = parseOccurredAt(raw);
  if (!dt) return "";
  const diffMs = Date.now() - dt.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function typeIcon(type) {
  switch (type) {
    case "BLOG":
      return FileText;
    case "ENQUIRY":
      return Mail;
    case "PROPERTY":
      return Home;
    case "PERMISSION":
      return ShieldAlert;
    default:
      return Bell;
  }
}

export function AdminNotifications() {
  const { isSuperAdmin, loading: roleLoading } = useAdminRole();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const seenAtRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    seenAtRef.current = stored ? new Date(stored) : null;
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    if (!isSuperAdmin) return;
    const base = getPublicApiBase();
    if (!base) return;
    setLoading(true);
    try {
      const res = await axios.get(`${base}admin/super/notifications`, {
        withCredentials: true,
        headers: authHeaders(),
      });
      const data = res.data || {};
      const list = Array.isArray(data.notifications) ? data.notifications : [];
      const seenAt = seenAtRef.current;

      const mapped = list.map((n) => {
        const occurred = parseOccurredAt(n.occurredAt);
        const isUnread =
          !seenAt || (occurred != null && occurred.getTime() > seenAt.getTime());
        return { ...n, isUnread };
      });

      setItems(mapped);
      setUnreadCount(mapped.filter((n) => n.isUnread).length);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  React.useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_MS);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [roleLoading, isSuperAdmin, fetchNotifications]);

  const markAllSeen = React.useCallback(() => {
    const now = new Date();
    seenAtRef.current = now;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, now.toISOString());
    }
    setItems((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    setUnreadCount(0);
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen) => {
      setOpen(nextOpen);
      if (nextOpen) {
        fetchNotifications();
      } else {
        markAllSeen();
      }
    },
    [fetchNotifications, markAllSeen],
  );

  const navigateTo = React.useCallback(
    (href) => {
      setOpen(false);
      markAllSeen();
      if (href) router.push(href);
    },
    [router, markAllSeen],
  );

  if (roleLoading || !isSuperAdmin) {
    return (
      <Button variant="ghost" size="icon" className="relative" disabled aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative admin-notifications-trigger"
          aria-label="Notifications"
          aria-expanded={open}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="admin-notifications-badge" aria-hidden>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="admin-notifications-panel w-80 p-0"
        sideOffset={8}
        collisionPadding={12}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="admin-notifications-panel__head">
          <span>Notifications</span>
          {unreadCount > 0 ? (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="admin-notifications-list">
          {loading && items.length === 0 ? (
            <p className="admin-notifications-empty">Loading…</p>
          ) : null}
          {!loading && items.length === 0 ? (
            <p className="admin-notifications-empty">
              No recent blog, enquiry, property, or permission activity.
            </p>
          ) : null}
          {items.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <DropdownMenuItem
                key={n.id}
                className="admin-notifications-item cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  navigateTo(n.href);
                }}
              >
                <div className="admin-notifications-item__row">
                  <div className={`admin-notifications-item__icon admin-notifications-item__icon--${(n.type || "default").toLowerCase()}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="admin-notifications-item__body">
                    <div className="admin-notifications-item__title-row">
                      {n.isUnread ? (
                        <span className="admin-notifications-item__dot" aria-hidden />
                      ) : null}
                      <span className="admin-notifications-item__title">{n.title}</span>
                    </div>
                    <p className="admin-notifications-item__message">{n.message}</p>
                    {n.actorName ? (
                      <p className="admin-notifications-item__actor">
                        By <strong>{n.actorName}</strong>
                        {n.taskLabel ? <> · {n.taskLabel}</> : null}
                      </p>
                    ) : null}
                    <span className="admin-notifications-item__time">
                      {formatRelativeTime(n.occurredAt)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem
          className="admin-notifications-footer justify-center text-primary cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            navigateTo("/admin/dashboard/activity-log");
          }}
        >
          View activity log
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AdminNotifications;
