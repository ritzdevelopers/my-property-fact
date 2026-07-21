"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { setToastRef } from "../_lib/adminToast";

const ToastContext = createContext(null);

const TOAST_VARIANTS = {
  success: {
    icon: faCheckCircle,
    className: "admin-toast--success",
    defaultTitle: "Success",
  },
  error: {
    icon: faExclamationCircle,
    className: "admin-toast--error",
    defaultTitle: "Error",
  },
  warning: {
    icon: faExclamationTriangle,
    className: "admin-toast--warning",
    defaultTitle: "Warning",
  },
  info: {
    icon: faInfoCircle,
    className: "admin-toast--info",
    defaultTitle: "Info",
  },
};

const DEFAULT_DURATION = 4500;
const MAX_TOASTS = 5;

function Toast({
  id,
  type,
  title,
  message,
  onDismiss,
  duration = DEFAULT_DURATION,
  isLoading = false,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingRef = useRef(duration);
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info;
  const isPersistent = isLoading || duration == null || duration <= 0;

  const startTimer = useCallback(() => {
    if (isPersistent) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, remainingRef.current);
  }, [isPersistent]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 320);
  }, [id, onDismiss, isExiting]);

  useEffect(() => {
    remainingRef.current =
      duration == null || duration <= 0 ? DEFAULT_DURATION : duration;
    setProgress(100);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [duration, isLoading, isPersistent]);

  useEffect(() => {
    if (isPaused) {
      pauseTimer();
    } else if (!isExiting) {
      startTimer();
    }
  }, [isPaused, isExiting, pauseTimer, startTimer]);

  useEffect(() => {
    if (isPersistent || isExiting || isPaused) return;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.max(((remainingRef.current - elapsed) / duration) * 100, 0);
      setProgress(newProgress);
    }, 50);
    return () => clearInterval(progressInterval);
  }, [duration, isExiting, isPaused, isPersistent]);

  return (
    <div
      className={`admin-toast ${variant.className}${isLoading ? " admin-toast--loading" : ""}${isExiting ? " admin-toast--exiting" : ""}`}
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => !isPersistent && setIsPaused(true)}
      onMouseLeave={() => !isPersistent && setIsPaused(false)}
    >
      <div className="admin-toast__icon-wrap">
        {isLoading ? (
          <span className="admin-toast__spinner" aria-hidden="true" />
        ) : (
          <FontAwesomeIcon icon={variant.icon} className="admin-toast__icon" />
        )}
      </div>
      <div className="admin-toast__content">
        {title && <div className="admin-toast__title">{title}</div>}
        {message && <div className="admin-toast__message">{message}</div>}
      </div>
      <button
        type="button"
        className="admin-toast__close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      {!isPersistent ? (
        <div className="admin-toast__progress">
          <div
            className="admin-toast__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="admin-toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((options) => {
    const { type = "info", title, message, duration = DEFAULT_DURATION } = 
      typeof options === "string" ? { message: options } : options;

    const id = ++toastIdRef.current;
    const variant = TOAST_VARIANTS[type];
    
    setToasts((prev) => {
      const newToasts = [...prev, { id, type, title: title || variant?.defaultTitle, message, duration }];
      if (newToasts.length > MAX_TOASTS) {
        return newToasts.slice(-MAX_TOASTS);
      }
      return newToasts;
    });

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id, options = {}) => {
    setToasts((prev) =>
      prev.map((toastItem) => {
        if (toastItem.id !== id) return toastItem;
        const nextType = options.type ?? toastItem.type;
        const variant = TOAST_VARIANTS[nextType] || TOAST_VARIANTS.info;
        return {
          ...toastItem,
          ...options,
          type: nextType,
          title:
            options.title ??
            (options.isLoading ? "Uploading" : variant?.defaultTitle),
          message: options.render ?? options.message ?? toastItem.message,
          duration:
            options.duration ??
            (options.isLoading ? null : DEFAULT_DURATION),
          isLoading: options.isLoading ?? false,
        };
      }),
    );
  }, []);

  const toast = useCallback((message) => addToast({ type: "info", message }), [addToast]);
  toast.success = useCallback((message, options = {}) => 
    addToast({ type: "success", message, ...options }), [addToast]);
  toast.error = useCallback((message, options = {}) => 
    addToast({ type: "error", message, ...options }), [addToast]);
  toast.warning = useCallback((message, options = {}) => 
    addToast({ type: "warning", message, ...options }), [addToast]);
  toast.info = useCallback((message, options = {}) => 
    addToast({ type: "info", message, ...options }), [addToast]);
  toast.loading = useCallback(
    (message, options = {}) =>
      addToast({
        type: "info",
        title: "Uploading",
        message,
        duration: null,
        isLoading: true,
        ...options,
      }),
    [addToast],
  );
  toast.update = updateToast;
  toast.dismiss = dismissToast;

  useEffect(() => {
    setToastRef(toast);
    return () => setToastRef(null);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, dismissToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within an AdminToastProvider");
  }
  return context.toast;
}

export default ToastContext;
