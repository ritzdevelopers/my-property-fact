import { NextResponse } from "next/server";

const CRM_BASE = "https://eldeco.4erealty.com/WebCreate.aspx";
const CRM_UID = process.env.CRM_RITZ_UID ?? "fourqt";
const CRM_PWD = process.env.CRM_RITZ_PWD ?? "wn9mxO76f34=";

 

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mob = digitsOnly(body.mob ?? "");
  if (mob.length < 10) {
    return NextResponse.json(
      { error: "Mobile number is required (digits only)." },
      { status: 400 },
    );
  }

  const uniqueId = String(body.uniqueId ?? "").trim();
  if (!uniqueId) {
    return NextResponse.json(
      { error: "UniqueId is required." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    UID: CRM_UID,
    PWD: CRM_PWD,
    Channel: "RGA",
    Src: "Ritz Google",
    ISD: "91",
    Mob: mob,
    Email: (body.email ?? "").trim(),
    name: (body.name ?? "").trim(),
    City: (body.city ?? "").trim(),
    Location: (body.location ?? "").trim(),
    Project: (body.project ?? "Eldeco Terra & Sol").trim(),
    Remark: (body.remark ?? "").trim(),
    url: (body.url ?? "").trim(),
    UniqueId: uniqueId,
    fld1: (body.fld1 ?? "").trim(),
    fld2: (body.fld2 ?? "").trim(),
    fld3: (body.fld3 ?? "").trim(),
    fld4: (body.fld4 ?? "").trim(),
  });

  const url = `${CRM_BASE}?${params.toString()}`;

  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "*/*",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `CRM responded with ${res.status}` },
      { status: 502 },
    );
  }
  console.log("response", res);
  return NextResponse.json({ ok: true });
}
