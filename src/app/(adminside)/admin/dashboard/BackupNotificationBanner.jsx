"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "../_lib/adminToast";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../_contexts/AdminRoleContext";
import "./backup-banner.css";

const DISMISS_SESSION_KEY = "mpf_backup_banner_dismissed";
const POLL_MS = 30_000;
const POLL_ACTIVE_MS = 3_000;

function adminFetchHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatBytes(bytes) {
  if (bytes == null || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatElapsed(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function BackupElapsedTimer({ startedAtIso, label }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAtIso) return undefined;
    const startMs = new Date(startedAtIso).getTime();
    if (Number.isNaN(startMs)) return undefined;
    const tick = () => setElapsed((Date.now() - startMs) / 1000);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAtIso]);

  if (!startedAtIso) return null;

  return (
    <div className="mpf-backup-banner__timer" aria-live="polite">
      <span className="mpf-backup-banner__spinner" aria-hidden />
      <span>
        {label} <strong>{formatElapsed(elapsed)}</strong>
      </span>
    </div>
  );
}

export default function BackupNotificationBanner() {
  const { isSuperAdmin, displayName, roleLoading } = useAdminRole();
  const [status, setStatus] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localPhase, setLocalPhase] = useState(null);
  const [timerStartIso, setTimerStartIso] = useState(null);
  const pollRef = useRef(null);
  const downloadAbortRef = useRef(null);

  const firstName =
    displayName && displayName.trim()
      ? displayName.trim().split(/\s+/)[0]
      : "Super Admin";

  const fetchStatus = useCallback(async () => {
    const base = getPublicApiBase();
    if (!base) return;
    try {
      const res = await fetch(`${base}admin/super/backup/status`, {
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setStatus((prev) => {
        if (
          prev?.bannerState === "inProgress" &&
          data.bannerState === "ready"
        ) {
          toast.success("Excel data backup is ready to download.");
        }
        return data;
      });
      if (data.bannerState === "inProgress" && data.startedAt) {
        setTimerStartIso(data.startedAt);
        setLocalPhase("building");
      }
      if (data.bannerState === "ready" || data.bannerState === "failed") {
        setLocalPhase((phase) => (phase === "building" ? null : phase));
      }
      if (data.bannerState === "none") {
        setHidden(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const isActive =
    localPhase === "building" ||
    localPhase === "downloading" ||
    status?.bannerState === "inProgress";

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(DISMISS_SESSION_KEY) === "1") {
        setHidden(true);
      }
    }
    fetchStatus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roleLoading, isSuperAdmin, fetchStatus]);

  useEffect(() => {
    if (roleLoading || !isSuperAdmin) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchStatus, isActive ? POLL_ACTIVE_MS : POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roleLoading, isSuperAdmin, isActive, fetchStatus]);

  if (roleLoading || !isSuperAdmin || hidden || !status) return null;
  if (status.bannerState === "none" && !localPhase) return null;

  const devPreview = status.devPreview === true;
  const runId = status.backupRunId;
  const isPreviewRun =
    runId == null || runId === -1 || String(runId) === "-1";

  const showBuilding =
    localPhase === "building" || status.bannerState === "inProgress";
  const showDownloading = localPhase === "downloading";
  const timerIso = timerStartIso || status.startedAt || new Date().toISOString();

  const handleDismiss = async () => {
    if (isPreviewRun || runId == null) {
      sessionStorage.setItem(DISMISS_SESSION_KEY, "1");
      setHidden(true);
      setLocalPhase(null);
      return;
    }
    const base = getPublicApiBase();
    if (!base) return;
    setBusy(true);
    try {
      await fetch(`${base}admin/super/backup/dismiss/${runId}`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      setHidden(true);
      setLocalPhase(null);
    } catch {
      toast.error("Could not dismiss notification.");
    } finally {
      setBusy(false);
    }
  };

  const handleStopBackup = async () => {
    const base = getPublicApiBase();
    if (!base) return;
    setBusy(true);
    const isMedia = status?.backupKind === "MEDIA";
    const path = isMedia
      ? "admin/super/backup/cancel/media"
      : "admin/super/backup/cancel";
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.ok) {
        toast.info("Backup stopped.");
        setLocalPhase(null);
        setTimerStartIso(null);
        await fetchStatus();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not stop backup.");
      }
    } catch {
      toast.error("Could not stop backup.");
    } finally {
      setBusy(false);
    }
  };

  const handleRunBackup = async () => {
    const base = getPublicApiBase();
    if (!base) return;
    setBusy(true);
    setLocalPhase("building");
    setTimerStartIso(new Date().toISOString());
    sessionStorage.removeItem(DISMISS_SESSION_KEY);
    setHidden(false);
    try {
      const res = await fetch(`${base}admin/super/backup/run`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}));
        toast.warn(err.message || "A backup is already running.");
        setLocalPhase("building");
        await fetchStatus();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || err.error || "Backup could not be started.");
        setLocalPhase(null);
        return;
      }
      await fetchStatus();
    } catch {
      toast.error("Backup could not be started.");
      setLocalPhase(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    if (isPreviewRun) {
      toast.info("Run a real backup first (Yes, backup now).");
      return;
    }
    const base = getPublicApiBase();
    if (!base || !runId) return;
    setBusy(true);
    setLocalPhase("downloading");
    setTimerStartIso(new Date().toISOString());
    const controller = new AbortController();
    downloadAbortRef.current = controller;
    try {
      const res = await fetch(`${base}admin/super/backup/download/${runId}`, {
        credentials: "include",
        headers: adminFetchHeaders(),
        signal: controller.signal,
      });
      if (!res.ok) {
        toast.error("Download failed.");
        setLocalPhase(null);
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/.exec(disp);
      const filename = match ? match[1] : `mpf-backup-${runId}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download complete.");
      if (!isPreviewRun && runId) {
        await fetch(`${base}admin/super/backup/dismiss/${runId}`, {
          method: "POST",
          credentials: "include",
          headers: adminFetchHeaders(),
        });
      }
      setHidden(true);
      setLocalPhase(null);
    } catch (e) {
      if (e?.name === "AbortError") return;
      toast.error("Download failed.");
      setLocalPhase(null);
    } finally {
      downloadAbortRef.current = null;
      setBusy(false);
    }
  };

  const handleStopDownload = () => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
      downloadAbortRef.current = null;
    }
    setLocalPhase(null);
    setTimerStartIso(null);
    setBusy(false);
    toast.info("Download cancelled.");
  };

  const state = status.bannerState;
  const sizeLabel = formatBytes(status.fileSizeBytes);

  return (
    <section
      className={`mpf-backup-banner mpf-backup-banner--${showDownloading ? "downloading" : state}`}
      role="region"
      aria-label="Data backup notification"
      aria-busy={showBuilding || showDownloading}
    >
      {devPreview && process.env.NODE_ENV === "development" ? (
        <span className="mpf-backup-banner__preview-tag">Local preview</span>
      ) : null}

      {showBuilding ? (
        <>
          <BackupElapsedTimer
            startedAtIso={timerIso}
            label={
              status?.backupKind === "MEDIA"
                ? "Packaging images…"
                : "Exporting admin data to Excel…"
            }
          />
          {status?.backupKind !== "MEDIA" ? (
            <p className="mpf-backup-banner__hint">
              Fast ZIP with .xlsx files (properties, enquiries, blogs, etc.). Images are a
              separate download on Data backup page.
            </p>
          ) : null}
          <div className="mpf-backup-banner__actions">
            <button
              type="button"
              className="mpf-backup-banner__btn"
              style={{ borderColor: "#dc2626", color: "#dc2626" }}
              disabled={busy}
              onClick={handleStopBackup}
            >
              Stop backup
            </button>
          </div>
        </>
      ) : null}

      {showDownloading ? (
        <>
          <BackupElapsedTimer startedAtIso={timerIso} label="Downloading backup…" />
          <div className="mpf-backup-banner__actions">
            <button
              type="button"
              className="mpf-backup-banner__btn"
              style={{ borderColor: "#dc2626", color: "#dc2626" }}
              disabled={busy}
              onClick={handleStopDownload}
            >
              Stop download
            </button>
          </div>
        </>
      ) : null}

      {!showBuilding && !showDownloading && state === "idleNoChanges" ? (
        <>
          <p className="mpf-backup-banner__text">
            Nothing new was added on the MPF site since last week. Export current admin
            data to Excel?
          </p>
          <div className="mpf-backup-banner__actions">
            <button
              type="button"
              className="mpf-backup-banner__btn mpf-backup-banner__btn--primary"
              disabled={busy}
              onClick={handleRunBackup}
            >
              Yes, export Excel
            </button>
            <button
              type="button"
              className="mpf-backup-banner__btn"
              disabled={busy}
              onClick={handleDismiss}
            >
              No, dismiss
            </button>
          </div>
        </>
      ) : null}

      {!showBuilding && !showDownloading && state === "ready" ? (
        <>
          <p className="mpf-backup-banner__text">
            Hey <strong>{status.firstName || firstName}</strong> — My Property Fact Excel
            data backup is ready. Download the .xlsx files (properties, enquiries, and more).
            {sizeLabel ? ` (${sizeLabel})` : ""}
          </p>
          <div className="mpf-backup-banner__actions">
            <button
              type="button"
              className="mpf-backup-banner__btn mpf-backup-banner__btn--primary"
              disabled={busy}
              onClick={handleDownload}
            >
              Download Excel ZIP
            </button>
            <button
              type="button"
              className="mpf-backup-banner__btn"
              disabled={busy}
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </>
      ) : null}

      {!showBuilding && !showDownloading && state === "failed" ? (
        <>
          <p className="mpf-backup-banner__text">
            Last backup failed{status.message ? `: ${status.message}` : "."}
          </p>
          <div className="mpf-backup-banner__actions">
            <button
              type="button"
              className="mpf-backup-banner__btn mpf-backup-banner__btn--primary"
              disabled={busy}
              onClick={handleRunBackup}
            >
              Retry backup
            </button>
            <button
              type="button"
              className="mpf-backup-banner__btn"
              disabled={busy}
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
