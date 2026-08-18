import { NextResponse } from "next/server";
import { validateLeadPhone } from "@/lib/leadValidation";
import { verifyLeadOtp } from "@/lib/leadOtpStore";

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      return NextResponse.json({ success: false, message: phoneError }, { status: 400 });
    }

    if (!String(otp || "").trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter the OTP" },
        { status: 400 },
      );
    }

    const result = verifyLeadOtp(phone, otp);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Verification failed" },
      { status: 500 },
    );
  }
}
