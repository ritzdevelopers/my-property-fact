import { NextResponse } from "next/server";
import { validateLeadPhone } from "@/lib/leadValidation";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
const BROKER_AUTH_SECRET = process.env.BROKER_AUTH_INTERNAL_SECRET || "";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, otp, fullName } = body;

    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      return NextResponse.json({ success: false, message: phoneError }, { status: 400 });
    }

    if (!otp || String(otp).trim().length !== 4) {
      return NextResponse.json(
        { success: false, message: "Please enter the 4-digit OTP" },
        { status: 400 },
      );
    }

    if (!API_BASE) {
      return NextResponse.json(
        { success: false, message: "Authentication service is not configured." },
        { status: 503 },
      );
    }

    if (!BROKER_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Auth is not configured on the server." },
        { status: 503 },
      );
    }

    const backendRes = await fetch(`${API_BASE}app/auth/phone/website`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Broker-Auth-Secret": BROKER_AUTH_SECRET,
      },
      body: JSON.stringify({
        phone,
        otp: String(otp).trim(),
        fullName: fullName || "",
      }),
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
