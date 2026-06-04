import { NextResponse } from "next/server";

export const revalidate = 1800;

function getChannelId() {
  const raw =
    process.env.YOUTUBE_CHANNEL_ID ||
    process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ||
    "";
  return raw.replace(/[;\s]+$/, "").trim();
}

export async function GET(request) {
  const id = getChannelId();
  if (!id) {
    return NextResponse.json(
      { error: "YOUTUBE_CHANNEL_ID or NEXT_PUBLIC_YOUTUBE_CHANNEL_ID not set" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error(`RSS HTTP ${res.status}`);
    const xml = await res.text();
    const videos = parseRSS(xml, limit);
    return NextResponse.json({ videos });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function parseRSS(xml, limit) {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
  return entries.slice(0, limit).map((e) => {
    const vid = tag(e, "yt:videoId");
    return {
      videoId: vid,
      title: dec(tag(e, "title")),
      author: dec(tag(e, "name")),
      published: tag(e, "published"),
      thumbnails: {
        maxres: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
        high: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      },
    };
  });
}

const tag = (x, t) => {
  const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`));
  return m ? m[1].trim() : "";
};

const dec = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
