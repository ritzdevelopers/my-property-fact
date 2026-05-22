"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { useAdminRole } from "../../_contexts/AdminRoleContext";
import BackupNotificationBanner from "../BackupNotificationBanner";
import "../backup-banner.css";

function adminFetchHeaders() {
  const token = typeof window !== "undefined" ? Cookies.get("token") : undefined;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatElapsed(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function BackupTimer({ startedAtIso, label }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAtIso) return undefined;
    const startMs = new Date(startedAtIso).getTime();
    const tick = () => setElapsed((Date.now() - startMs) / 1000);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAtIso]);
  if (!startedAtIso) return null;
  return (
    <div className="mpf-backup-banner__timer">
      <span className="mpf-backup-banner__spinner" aria-hidden />
      <span>
        {label} <strong>{formatElapsed(elapsed)}</strong>
      </span>
    </div>
  );
}

export default function DataBackupPage() {
  const { isSuperAdmin, roleLoading } = useAdminRole();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excelBusy, setExcelBusy] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [timerLabel, setTimerLabel] = useState("");
  const pollAbortRef = useRef(false);
  const downloadAbortRef = useRef(null);

  const loadHistory = useCallback(async () => {
    const base = getPublicApiBase();
    if (!base) return;
    setLoading(true);
    try {
      const res = await fetch(`${base}admin/super/backup/history?page=0&size=20`, {
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.content || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roleLoading && isSuperAdmin) loadHistory();
  }, [roleLoading, isSuperAdmin, loadHistory]);

  const inProgressFromHistory = history.some((r) => r.status === "IN_PROGRESS");

  const pollUntilReady = async (runId, kind) => {
    const base = getPublicApiBase();
    if (!base || !runId) return;
    pollAbortRef.current = false;
    for (let i = 0; i < 120; i++) {
      if (pollAbortRef.current) return;
      await new Promise((r) => setTimeout(r, 2000));
      if (pollAbortRef.current) return;
      const res = await fetch(`${base}admin/super/backup/history?page=0&size=5`, {
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const row = (data.content || []).find((r) => r.id === runId);
      if (row?.status === "READY") {
        toast.success(`${kind} backup ready — use Download below.`);
        await loadHistory();
        return;
      }
      if (row?.status === "FAILED" || row?.status === "CANCELLED") {
        if (row.status === "CANCELLED") {
          toast.info("Backup stopped.");
        } else {
          toast.error(row.errorMessage || "Backup failed.");
        }
        await loadHistory();
        return;
      }
    }
    if (!pollAbortRef.current) {
      toast.info("Still preparing… check History in a moment.");
      await loadHistory();
    }
  };

  const stopAllBackups = async () => {
    const base = getPublicApiBase();
    if (!base) return;
    pollAbortRef.current = true;
    try {
      const res = await fetch(`${base}admin/super/backup/cancel/all`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.ok) toast.info("Backup stopped.");
      else toast.error("Could not stop backup.");
    } catch {
      toast.error("Could not stop backup.");
    } finally {
      setExcelBusy(false);
      setMediaBusy(false);
      setTimerStart(null);
      await loadHistory();
    }
  };

  const stopBackup = async (kind) => {
    const base = getPublicApiBase();
    if (!base) return;
    pollAbortRef.current = true;
    const path =
      kind === "MEDIA" ? "admin/super/backup/cancel/media" : "admin/super/backup/cancel";
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.ok) {
        toast.info("Backup stopped.");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Could not stop backup.");
      }
    } catch {
      toast.error("Could not stop backup.");
    } finally {
      setExcelBusy(false);
      setMediaBusy(false);
      setTimerStart(null);
      await loadHistory();
    }
  };

  const stopDownload = () => {
    if (downloadAbortRef.current) {
      downloadAbortRef.current.abort();
      downloadAbortRef.current = null;
    }
    setTimerStart(null);
    toast.info("Download cancelled.");
  };

  const runExcel = async () => {
    const base = getPublicApiBase();
    if (!base) return;
    setExcelBusy(true);
    setTimerStart(new Date().toISOString());
    setTimerLabel("Exporting Excel data");
    try {
      const res = await fetch(`${base}admin/super/backup/run`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (!res.ok) {
        toast.error("Could not start Excel export.");
        return;
      }
      const data = await res.json();
      await pollUntilReady(data.backupRunId, "Excel");
    } catch {
      toast.error("Could not start Excel export.");
    } finally {
      setExcelBusy(false);
      setTimerStart(null);
    }
  };

  const runMedia = async () => {
    const base = getPublicApiBase();
    if (!base) return;
    setMediaBusy(true);
    setTimerStart(new Date().toISOString());
    setTimerLabel("Packaging images (this may take a while)");
    try {
      const res = await fetch(`${base}admin/super/backup/run/media`, {
        method: "POST",
        credentials: "include",
        headers: adminFetchHeaders(),
      });
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}));
        toast.warn(err.message || "Image backup already running. Use Stop backup.");
        await loadHistory();
        return;
      }
      if (!res.ok) {
        toast.error("Could not start image backup.");
        return;
      }
      const data = await res.json();
      await pollUntilReady(data.backupRunId, "Images");
    } catch {
      toast.error("Could not start image backup.");
    } finally {
      setMediaBusy(false);
      setTimerStart(null);
    }
  };

  const downloadRun = async (row) => {
    const base = getPublicApiBase();
    if (!base || !row?.id) return;
    setTimerStart(new Date().toISOString());
    setTimerLabel("Downloading");
    const controller = new AbortController();
    downloadAbortRef.current = controller;
    try {
      const res = await fetch(`${base}admin/super/backup/download/${row.id}`, {
        credentials: "include",
        headers: adminFetchHeaders(),
        signal: controller.signal,
      });
      if (!res.ok) {
        toast.error("Download failed.");
        return;
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/.exec(disp);
      const filename = match ? match[1] : `mpf-backup-${row.id}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download complete.");
    } catch (e) {
      if (e?.name === "AbortError") return;
      toast.error("Download failed.");
    } finally {
      downloadAbortRef.current = null;
      setTimerStart(null);
    }
  };

  if (roleLoading) {
    return <p style={{ padding: "1rem" }}>Loading…</p>;
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: "1rem" }}>
        <p>You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="mpf-data-backup-page" style={{ padding: "0 0 2rem" }}>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.35rem" }}>
        Data backup
      </h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
        <strong>Fast:</strong> Excel files for projects, enquiries, blogs, listings, and more
        (usually under a minute). <strong>Slow:</strong> separate image ZIP — only when you need
        all uploads.
      </p>

      <BackupNotificationBanner />

      {timerStart ? <BackupTimer startedAtIso={timerStart} label={timerLabel} /> : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          className="mpf-backup-banner__btn mpf-backup-banner__btn--primary"
          disabled={excelBusy || mediaBusy}
          onClick={runExcel}
        >
          Download Excel data
        </button>
        <button
          type="button"
          className="mpf-backup-banner__btn"
          disabled={excelBusy || mediaBusy}
          onClick={runMedia}
        >
          Download images (ZIP)
        </button>
        {(excelBusy || mediaBusy || inProgressFromHistory) && timerLabel !== "Downloading" ? (
          <button
            type="button"
            className="mpf-backup-banner__btn"
            style={{ borderColor: "#dc2626", color: "#dc2626" }}
            onClick={() => {
              if (excelBusy) stopBackup("EXCEL");
              else if (mediaBusy) stopBackup("MEDIA");
              else stopAllBackups();
            }}
          >
            Stop backup
          </button>
        ) : null}
        {timerLabel === "Downloading" ? (
          <button
            type="button"
            className="mpf-backup-banner__btn"
            style={{ borderColor: "#dc2626", color: "#dc2626" }}
            onClick={stopDownload}
          >
            Stop download
          </button>
        ) : null}
      </div>

      <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>History</h2>
      {loading ? (
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Loading…</p>
      ) : history.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>No backup runs yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "0.5rem" }}>When</th>
                <th style={{ padding: "0.5rem" }}>Type</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Size</th>
                <th style={{ padding: "0.5rem" }} />
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.5rem" }}>{row.createdAt || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>{row.backupKind || "EXCEL"}</td>
                  <td style={{ padding: "0.5rem" }}>{row.status}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {row.fileSizeBytes
                      ? `${(row.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                      : "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {row.status === "READY" ? (
                      <button
                        type="button"
                        className="mpf-backup-banner__btn mpf-backup-banner__btn--primary"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        onClick={() => downloadRun(row)}
                      >
                        Download
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
