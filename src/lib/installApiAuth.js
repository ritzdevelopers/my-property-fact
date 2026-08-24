"use client";

import axios from "axios";
import { getAccessToken, isMpfBackendUrl } from "./apiAuth";

const INSTALL_FLAG = "__mpfApiAuthInstalled";

function resolveRequestUrl(config) {
  const url = config.url || "";
  const base = config.baseURL || "";
  if (/^https?:\/\//i.test(url)) return url;
  if (/^https?:\/\//i.test(base)) {
    return `${String(base).replace(/\/+$/, "")}/${String(url).replace(/^\/+/, "")}`;
  }
  return `${base}${url}`;
}

function toSameOriginApiUrl(url) {
  if (!url) return url;
  const value = String(url);
  if (value.startsWith("/api/v1/")) return value;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.pathname.startsWith("/api/v1/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // ignore invalid URLs
  }
  return value;
}

function applyBearerToAxiosConfig(config, token) {
  const headers = config.headers;
  if (headers && typeof headers.set === "function") {
    if (!headers.get("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return;
  }
  const current = headers?.Authorization || headers?.authorization;
  if (!current) {
    config.headers = { ...(headers || {}), Authorization: `Bearer ${token}` };
  }
}

function attachAxiosAuth(config) {
  const url = resolveRequestUrl(config);
  if (!isMpfBackendUrl(url)) return config;

  // Keep admin HttpOnly session cookies working on the API host.
  if (config.withCredentials == null) {
    config.withCredentials = true;
  }

  const token = getAccessToken();
  if (token) {
    applyBearerToAxiosConfig(config, token);
    // JWT lives on the frontend host. Use the Next.js /api/v1 rewrite so
    // Authorization is same-origin (no CORS preflight) and the token cookie
    // is also sent. Admin session cookies stay on the API host — we only
    // rewrite when a portal JWT is present.
    const sameOrigin = toSameOriginApiUrl(url);
    if (sameOrigin !== url) {
      config.baseURL = undefined;
      config.url = sameOrigin;
    }
  }
  return config;
}

export function installApiAuth() {
  if (typeof window === "undefined") return;
  if (window[INSTALL_FLAG]) return;
  window[INSTALL_FLAG] = true;

  axios.interceptors.request.use(attachAxiosAuth);

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (!isMpfBackendUrl(url)) {
      return originalFetch(input, init);
    }

    const nextInit = { ...init };
    if (nextInit.credentials == null) {
      nextInit.credentials = "include";
    }

    const token = getAccessToken();
    if (token) {
      const inherited =
        init.headers ||
        (typeof input !== "string" && input && "headers" in input
          ? input.headers
          : undefined);
      const headers = new Headers(inherited || undefined);
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      nextInit.headers = headers;
      const sameOrigin = toSameOriginApiUrl(url);
      if (sameOrigin !== url) {
        input = sameOrigin;
      }
    }

    return originalFetch(input, nextInit);
  };
}

installApiAuth();
