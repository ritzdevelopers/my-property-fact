/** True once OTP SMS has been sent — form fields stay hidden until reset. */
export function isLeadFormOtpActive(leadOtp) {
  return Boolean(leadOtp?.otpSent);
}

export function leadFormOtpActiveClass(leadOtp) {
  return isLeadFormOtpActive(leadOtp) ? "lead-form--otp-active" : "";
}

export function leadFormSplitOtpActiveClass(leadOtp) {
  return isLeadFormOtpActive(leadOtp) ? "lead-form-split--otp-active" : "";
}
