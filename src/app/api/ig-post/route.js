import { NextResponse } from "next/server";

export const revalidate = 3600;

function getFbAppToken() {
  const raw = process.env.FB_APP_TOKEN || "";
  return raw.replace(/[;\s"]+$/g, "").trim();
}

function normalizeInstagramUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "instagram.com") return null;
  const path = url.pathname;
  const isPost =
    /^\/(p|reel|tv)\/[^/]+\/?$/i.test(path) ||
    /^\/[^/]+\/(p|reel|tv)\/[^/]+\/?$/i.test(path);
  if (!isPost) return null;
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "") + "/";
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num) =>
      String.fromCodePoint(parseInt(num, 10))
    );
}

function unescapeJsonUrl(s) {
  return s.replace(/\\u0026/g, "&").replace(/\\\//g, "/").replace(/\\"/g, '"');
}

function extractVideoUrl(html) {
  const og =
    metaContent(html, "og:video:secure_url") ||
    metaContent(html, "og:video") ||
    metaContent(html, "og:video:url");
  if (og) return og;

  const patterns = [
    /"video_url":"([^"]+)"/,
    /"contentUrl":"(https:\\\/\\\/[^"]+\.mp4[^"]*)"/,
    /"contentUrl":"(https:\/\/[^"]+\.mp4[^"]*)"/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return unescapeJsonUrl(m[1]);
  }
  return null;
}

function isVideoPostUrl(url) {
  return /\/(reel|tv)\//i.test(url);
}

function metaContent(html, prop) {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeHtml(m[1]);
  }
  return "";
}

async function fetchMetaOembed(url, token) {
  const apiUrl = new URL("https://graph.facebook.com/v22.0/instagram_oembed");
  apiUrl.searchParams.set("url", url);
  apiUrl.searchParams.set("access_token", token);
  apiUrl.searchParams.set("omitscript", "true");

  const res = await fetch(apiUrl.toString(), { next: { revalidate: 3600 } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || `oEmbed HTTP ${res.status}`);
  }
  return body;
}

async function fetchOpenGraph(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "facebookexternalhit/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Instagram page HTTP ${res.status}`);
  const html = await res.text();
  const thumbnail_url = metaContent(html, "og:image");
  const caption =
    metaContent(html, "og:description") || metaContent(html, "og:title");
  const video_url = extractVideoUrl(html);
  if (!thumbnail_url) throw new Error("No preview image found for this post");
  const is_video = Boolean(video_url) || isVideoPostUrl(url);
  return {
    thumbnail_url,
    video_url: video_url || null,
    is_video,
    caption,
    author_name: metaContent(html, "og:site_name") || "Instagram",
    html: null,
  };
}

function toClientPayload(data, postUrl) {
  const video_url = data.video_url || data.media_url || null;
  const is_video = Boolean(video_url) || (postUrl ? isVideoPostUrl(postUrl) : false);
  return {
    thumbnail_url: data.thumbnail_url || null,
    video_url,
    is_video,
    caption: data.title || data.caption || "",
    author_name: data.author_name || "",
    html: data.html || null,
  };
}

async function enrichWithOpenGraphVideo(payload, url) {
  if (payload.video_url) return payload;
  try {
    const og = await fetchOpenGraph(url);
    return {
      ...payload,
      video_url: og.video_url || payload.video_url,
      is_video: Boolean(og.video_url) || payload.is_video || isVideoPostUrl(url),
      caption: payload.caption || og.caption,
      thumbnail_url: payload.thumbnail_url || og.thumbnail_url,
    };
  } catch {
    return payload;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url query parameter required" }, { status: 400 });
  }

  const url = normalizeInstagramUrl(rawUrl);
  if (!url) {
    return NextResponse.json({ error: "Invalid Instagram post URL" }, { status: 400 });
  }

  const token = getFbAppToken();
  const errors = [];

  if (token) {
    try {
      const data = await fetchMetaOembed(url, token);
      let payload = toClientPayload(data, url);
      if (payload.thumbnail_url) {
        if (payload.is_video && !payload.video_url) {
          payload = await enrichWithOpenGraphVideo(payload, url);
        }
        return NextResponse.json(payload);
      }
      errors.push("oEmbed returned no thumbnail");
    } catch (err) {
      errors.push(err.message);
    }
  } else {
    errors.push("FB_APP_TOKEN not set");
  }

  try {
    const payload = await fetchOpenGraph(url);
    return NextResponse.json(payload);
  } catch (err) {
    errors.push(err.message);
    return NextResponse.json(
      {
        error:
          "Instagram post load failed. Add FB_APP_TOKEN to .env (APP_ID|CLIENT_TOKEN) and restart the server.",
        details: errors,
      },
      { status: 502 }
    );
  }
}
