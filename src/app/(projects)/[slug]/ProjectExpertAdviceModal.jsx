"use client";



import { useCallback, useEffect, useRef, useState } from "react";

import { Modal } from "react-bootstrap";

import axios from "axios";

import { toast } from "react-toastify";

import { usePathname } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { buildEnquirySubmitData, warmUpLiveLocation } from "@/lib/leadTracker";

import { validateLeadPhone, normalizeIndianPhone } from "@/lib/leadValidation";

import { useLeadOtp } from "@/hooks/useLeadOtp";

import LeadOtpFields from "@/components/LeadOtpFields";

import "@/app/(home)/components/common/popupform.css";

import {

  buildProjectDetailPublicUrl,

  getProjectPropertyId,

  openExpertAdviceWhatsApp,
  resetExpertAdviceWhatsAppOpenGuard,
} from "@/lib/projectExpertAdviceLead";

import "@/components/LeadOtpFields.css";

import "@/components/leadFormSplitLayout.css";

import "./projectExpertAdviceModal.css";



const PLACEHOLDER_EMAIL = "social@mypropertyfact.com";



function maskPhone(phone) {

  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 4) return digits;

  return `+91 ${digits.slice(0, 2)}****${digits.slice(-4)}`;

}



export default function ProjectExpertAdviceModal({

  show,

  onClose,

  projectDetail,

}) {

  const pathname = usePathname();

  const [phone, setPhone] = useState("");

  const [phoneError, setPhoneError] = useState("");

  const [saveFailed, setSaveFailed] = useState(false);

  const [leadSaved, setLeadSaved] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const leadOtp = useLeadOtp(phone, { autoVerify: false });

  const leadSavedRef = useRef(false);

  const completingRef = useRef(false);

  const flowFinishedRef = useRef(false);
  const whatsappOpenedRef = useRef(false);



  const projectName = projectDetail?.projectName || "Project";

  const step = leadOtp.otpSent ? 2 : 1;



  const resetState = useCallback(() => {

    setPhone("");

    setPhoneError("");

    setSaveFailed(false);

    setLeadSaved(false);

    setIsCompleting(false);

    leadSavedRef.current = false;

    completingRef.current = false;

    flowFinishedRef.current = false;
    whatsappOpenedRef.current = false;
    resetExpertAdviceWhatsAppOpenGuard();

    leadOtp.reset();

  }, [leadOtp]);



  const closeModal = useCallback(() => {

    onClose(false);

    resetState();

  }, [onClose, resetState]);



  useEffect(() => {

    if (!show) {

      resetState();

      return;

    }

    warmUpLiveLocation();

  }, [show, resetState]);



  const saveExpertAdviceLead = useCallback(async () => {

    const normalizedPhone = normalizeIndianPhone(phone);

    const projectUrl = buildProjectDetailPublicUrl(projectDetail, pathname);

    const propertyId = getProjectPropertyId(projectDetail);

    const listingPath = pathname || null;



    const submitData = await buildEnquirySubmitData(

      {

        id: 0,

        name: "Expert Advice",

        email: PLACEHOLDER_EMAIL,

        phone: normalizedPhone,

        message: `Verified mobile enquiry for expert property advice on ${projectName}. User opted to continue on WhatsApp.`,

        enquiryFrom: `Expert Property Advice - ${projectName}`,

        projectLink: projectUrl,

        pageName: "Project Detail - Expert Property Advice",

        status: "PENDING",

        ...(propertyId ? { propertyId } : {}),

      },

      {

        property: {

          property_name: projectName,

          project: projectName,

          builder:
            projectDetail?.builderName ??
            projectDetail?.builder?.builderName ??
            null,

          city: projectDetail?.city ?? projectDetail?.cityName ?? null,

          locality: projectDetail?.projectLocality ?? null,

          source_listing_page: listingPath,

        },

        whatsapp: normalizedPhone,

      },

    );



    const response = await axios.post(

      `${process.env.NEXT_PUBLIC_API_URL}enquiry/post`,

      submitData,

      { headers: { "Content-Type": "application/json" } },

    );



    if (response.data?.isSuccess !== 1) {

      throw new Error("REQUEST_FAILED");

    }

  }, [phone, projectDetail, projectName, pathname]);



  const completeAfterVerification = useCallback(async () => {
    if (flowFinishedRef.current || completingRef.current) return;

    completingRef.current = true;
    setIsCompleting(true);
    setSaveFailed(false);

    try {
      if (!leadSavedRef.current) {
        await saveExpertAdviceLead();
        leadSavedRef.current = true;
        setLeadSaved(true);
      }

      if (!whatsappOpenedRef.current) {
        whatsappOpenedRef.current = true;
        openExpertAdviceWhatsApp(projectDetail, pathname);
      }
      flowFinishedRef.current = true;
      closeModal();
    } catch (error) {
      console.error("Expert advice post-verify flow failed:", error);
      setSaveFailed(true);
      toast.error("Something went wrong. Please try again.");
    } finally {
      completingRef.current = false;
      setIsCompleting(false);
    }
  }, [saveExpertAdviceLead, projectDetail, pathname, closeModal]);



  const handleSendOtp = async (event) => {

    event?.preventDefault();

    const error = validateLeadPhone(phone);

    setPhoneError(error);

    if (error) {

      toast.error(error);

      return;

    }



    const sent = await leadOtp.sendOtp();

    if (!sent && leadOtp.error) {

      toast.error(leadOtp.error);

    }

  };



  const handleVerifyOtp = async () => {
    if (leadOtp.isVerified || isCompleting || completingRef.current) return;

    if (!String(leadOtp.otp || "").trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsCompleting(true);

    const ok = await leadOtp.verifyOtp();

    if (!ok) {
      setIsCompleting(false);
      if (leadOtp.error) {
        toast.error(leadOtp.error);
      }
      return;
    }

    await completeAfterVerification();
  };



  const handleRetryAfterSaveFail = () => {

    if (leadSaved) {
      if (!whatsappOpenedRef.current) {
        whatsappOpenedRef.current = true;
        openExpertAdviceWhatsApp(projectDetail, pathname);
      }

      flowFinishedRef.current = true;

      closeModal();

      return;

    }

    completeAfterVerification();

  };



  const handleChangeNumber = () => {

    leadOtp.reset();

    setSaveFailed(false);

  };



  if (isCompleting && !saveFailed) {

    return (

      <Modal

        show={show}

        onHide={closeModal}

        centered

        restoreFocus={false}

        backdropClassName="enquiry-popup-backdrop"

        className="enquiry-popup pd3-expert-advice-modal"

        dialogClassName="pd3-expert-advice-dialog"

      >

        <div className="pd3-expert-advice-modal__inner pd3-expert-advice-modal__inner--busy" />

      </Modal>

    );

  }



  return (

    <Modal

      show={show}

      onHide={closeModal}

      centered

      restoreFocus={false}

      backdropClassName="enquiry-popup-backdrop"

      className="enquiry-popup pd3-expert-advice-modal"

      dialogClassName="pd3-expert-advice-dialog"

    >

      <div className="pd3-expert-advice-modal__inner">

        <button

          type="button"

          className="pd3-expert-advice-modal__close"

          onClick={closeModal}

          aria-label="Close"

        >

          <FontAwesomeIcon icon={faTimes} />

        </button>



        <header className="pd3-expert-advice-modal__head">

          <h2 className="pd3-expert-advice-modal__title">

            Get Expert Property Advice

          </h2>

          {step === 1 ? (

            <p className="pd3-expert-advice-modal__subtitle">

              Enter your mobile number to connect on WhatsApp

              about {projectName}.

            </p>

          ) : (

            <p className="pd3-expert-advice-modal__subtitle">

              Code sent to {maskPhone(phone)}.{" "}

              <button

                type="button"

                className="pd3-expert-advice-modal__link"

                onClick={handleChangeNumber}

              >

                Change number

              </button>

            </p>

          )}

        </header>



        {step === 1 ? (

          <form

            className="pd3-expert-advice-form"

            onSubmit={handleSendOtp}

            noValidate

          >

            <label className="pd3-expert-advice-label" htmlFor="pd3-expert-phone">

              Mobile Number

            </label>

            <input

              id="pd3-expert-phone"

              type="tel"

              name="phone"

              className={`pd3-expert-advice-input ${phoneError ? "is-invalid" : ""}`}

              placeholder="+91 00000 00000"

              value={phone}

              onChange={(e) => {

                setPhone(e.target.value);

                if (phoneError) setPhoneError("");

              }}

              onBlur={() => setPhoneError(validateLeadPhone(phone))}

              autoComplete="tel"

              required

            />

            {phoneError ? (

              <p className="pd3-expert-advice-error" role="alert">{phoneError}</p>

            ) : null}

            <button

              type="submit"

              className="pd3-expert-advice-btn"

              disabled={leadOtp.sending}

            >

              {leadOtp.sending ? "Sending…" : "Send OTP"}

            </button>

          </form>

        ) : (

          <div className="pd3-expert-advice-form">

            <p className="pd3-expert-advice-label">Enter OTP</p>

            <LeadOtpFields

              phone={phone}

              otp={leadOtp.otp}

              onOtpChange={leadOtp.setOtp}

              otpSent={leadOtp.otpSent}

              isVerified={leadOtp.isVerified}

              sending={leadOtp.sending}

              verifying={leadOtp.verifying}

              error={leadOtp.error}

              resendSeconds={leadOtp.resendSeconds}

              onSendOtp={leadOtp.sendOtp}

              submitFlow

              variant="contact"

              className="pd3-expert-advice-otp-panel"

            />



            {saveFailed ? (

              <button

                type="button"

                className="pd3-expert-advice-btn"

                onClick={handleRetryAfterSaveFail}

              >

                {leadSaved ? "Open WhatsApp" : "Try again"}

              </button>

            ) : (

              <button

                type="button"

                className="pd3-expert-advice-btn"

                onClick={handleVerifyOtp}

                disabled={leadOtp.verifying || leadOtp.otp.length < 4}

              >

                {leadOtp.verifying ? "Verifying…" : "Verify OTP"}

              </button>

            )}

          </div>

        )}

      </div>

    </Modal>

  );

}


