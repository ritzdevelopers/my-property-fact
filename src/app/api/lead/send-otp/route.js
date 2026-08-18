import { NextResponse } from "next/server";
import { validateLeadPhone } from "@/lib/leadValidation";
import { createLeadOtp } from "@/lib/leadOtpStore";
import { sendLeadOtpSms } from "@/lib/leadOtpSms";

export async function POST(request) {
  try {
    const { phone } = await request.json();
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      return NextResponse.json({ success: false, message: phoneError }, { status: 400 });
    }

    const otp = createLeadOtp(phone);
    await sendLeadOtpSms(phone, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    const message = error?.message || "Could not send OTP. Please try again.";
    const status = message.includes("wait")
      ? 429
      : message.includes("temporarily unavailable")
        ? 503
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
