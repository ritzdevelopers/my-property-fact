"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

function Home() {
    const [floatingPhone, setFloatingPhone] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [popupPhone, setPopupPhone] = useState("");
    const floatingLeadOtp = useLeadOtp(floatingPhone);
    const contactLeadOtp = useLeadOtp(contactPhone);
    const popupLeadOtp = useLeadOtp(popupPhone);
    const floatingPhoneRef = useRef(floatingPhone);
    const contactPhoneRef = useRef(contactPhone);
    const popupPhoneRef = useRef(popupPhone);
    const floatingLeadOtpRef = useRef(floatingLeadOtp);
    const contactLeadOtpRef = useRef(contactLeadOtp);
    const popupLeadOtpRef = useRef(popupLeadOtp);

    useEffect(() => {
        floatingPhoneRef.current = floatingPhone;
        contactPhoneRef.current = contactPhone;
        popupPhoneRef.current = popupPhone;
        floatingLeadOtpRef.current = floatingLeadOtp;
        contactLeadOtpRef.current = contactLeadOtp;
        popupLeadOtpRef.current = popupLeadOtp;
    }, [floatingPhone, contactPhone, popupPhone, floatingLeadOtp, contactLeadOtp, popupLeadOtp]);

    useEffect(() => {
        const runNavbarScripts = () => {
            if (typeof window === "undefined" || !window.$) return null;
            const $ = window.$;
            const desktopMinWidth = 992;
            const isDesktop = () => window.matchMedia(`(min-width: ${desktopMinWidth}px)`).matches;

            const onScroll = function () {
                if ($(this).scrollTop() > 50) {
                    $(".navbar").addClass("scrolled");
                    $(".nav-link, .navbar-brand").removeClass("text-white").addClass("text-dark");
                } else {
                    $(".navbar").removeClass("scrolled");
                    $(".nav-link, .navbar-brand").removeClass("text-dark").addClass("text-white");
                }
            };

            function updateNavbarActiveSection() {
                if (!isDesktop()) return;
                var scrollPos = $(document).scrollTop();
                var nav = $(".navbar-nav");
                if (!nav.length) return;
                var sectionLinks = nav.find(".nav-link[href^='#']");
                var offset = 100;
                var currentLink = null;
                sectionLinks.each(function () {
                    var href = $(this).attr("href");
                    if (!href || href === "#") return;
                    var section = $(href);
                    if (!section.length) return;
                    var top = section.offset().top;
                    if (top <= scrollPos + offset) {
                        currentLink = this;
                    }
                });
                if (currentLink) {
                    sectionLinks.removeClass("active");
                    $(currentLink).addClass("active");
                } else if (sectionLinks.length) {
                    sectionLinks.removeClass("active");
                    if (scrollPos < 100) {
                        sectionLinks.first().addClass("active");
                    } else {
                        sectionLinks.last().addClass("active");
                    }
                }
            }

            function clearActiveOnMobile() {
                if (!isDesktop()) {
                    $(".navbar-nav .nav-link[href^='#']").removeClass("active");
                }
            }

            $(window).on("scroll", onScroll);
            $(window).on("scroll", updateNavbarActiveSection);
            $(window).on("load", updateNavbarActiveSection);
            $(window).on("load", clearActiveOnMobile);
            $(function () {
                if (isDesktop()) updateNavbarActiveSection();
                else clearActiveOnMobile();
            });

            const onNavClick = function () {
                var href = $(this).attr("href");
                if (!href || href === "#") return;
                if (isDesktop()) {
                    setTimeout(updateNavbarActiveSection, 100);
                    setTimeout(updateNavbarActiveSection, 450);
                }
            };
            $(".navbar-nav .nav-link[href^='#']").on("click", onNavClick);

            const mql = window.matchMedia(`(min-width: ${desktopMinWidth}px)`);
            const onResize = () => {
                if (isDesktop()) updateNavbarActiveSection();
                else clearActiveOnMobile();
            };
            mql.addEventListener("change", onResize);

            return () => {
                $(window).off("scroll", onScroll);
                $(window).off("scroll", updateNavbarActiveSection);
                $(window).off("load", updateNavbarActiveSection);
                $(window).off("load", clearActiveOnMobile);
                $(".navbar-nav .nav-link[href^='#']").off("click", onNavClick);
                mql.removeEventListener("change", onResize);
            };
        };
        let cleanup = runNavbarScripts();
        if (!cleanup) {
            const id = setInterval(() => {
                cleanup = runNavbarScripts();
                if (cleanup) clearInterval(id);
            }, 50);
            return () => clearInterval(id);
        }
        return cleanup;
    }, []);

    useEffect(() => {
        function openCity(evt, cityName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            document.getElementById(cityName).style.display = "block";
            evt.currentTarget.className += " active";
        }
        window.openCity = openCity;
        const el = document.getElementById("defaultOpen");
        if (el) el.click();
        return () => { delete window.openCity; };
    }, []);

    useEffect(() => {
        const runViewboxScripts = () => {
            if (typeof window === "undefined" || !window.$) return false;
            const $ = window.$;
            if (typeof $.fn.viewbox !== "function") return false;
            $("#myTab .nav-link").removeClass("active");
            $("#amenities-tab1-tab").addClass("active");
            $("#myTabContent .tab-pane").removeClass("show active");
            $("#amenitiestab1").addClass("show active");
            $("#gallery .thumbnail").viewbox();
            $("#floors-plan .thumbnail").viewbox();
            $(".thumbnail-2").viewbox();
            const vb = $(".popup-link").viewbox();
            $(".popup-open-button").on("click", function () {
                vb.trigger("viewbox.open");
            });
            $(".close-button").on("click", function () {
                vb.trigger("viewbox.close");
            });
            return true;
        };
        if (runViewboxScripts()) return;
        const id = setInterval(() => {
            if (runViewboxScripts()) clearInterval(id);
        }, 100);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const runOwlCarousel = () => {
            if (typeof window === "undefined" || !window.$) return false;
            const $ = window.$;
            if (typeof $.fn.owlCarousel !== "function") return false;
            const $el = $("#floorplan-carousel");
            if (!$el.length) return true;
            $el.owlCarousel({
                loop: true,
                margin: 0,
                nav: true,
                navText: [
                    "<span><img src='/eldeco-la-vida-bella-images2/images/arrow_left.png'></span>",
                    "<span><img src='/eldeco-la-vida-bella-images2/images/arrow_right.png'></span>",
                ],
                dots: false,
                autoplay: false,
                responsive: {
                    0: { items: 2 },
                    500: { items: 2 },
                    600: { items: 2 },
                    1000: { items: 3 },
                },
            });
            return true;
        };
        if (runOwlCarousel()) return;
        const id = setInterval(() => {
            if (runOwlCarousel()) clearInterval(id);
        }, 100);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const toggleBtn = document.getElementById("toggleBtn");
        const contactForm = document.getElementById("contactForm");
        const icon = document.getElementById("icon");
        if (!toggleBtn || !contactForm || !icon) return;
        const onToggle = () => {
            contactForm.classList.toggle("open");
            if (contactForm.classList.contains("open")) {
                icon.innerText = "–";
            } else {
                icon.innerText = "+";
            }
        };
        toggleBtn.addEventListener("click", onToggle);
        return () => toggleBtn.removeEventListener("click", onToggle);
    }, []);

    useEffect(() => {
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        function validateMobile(mobile) {
            const mobileRegex = /^[6-9]\d{9}$/;
            return mobileRegex.test(mobile.replace(/\D/g, ""));
        }
        function showError(inputId, errorId, message) {
            const input = document.getElementById(inputId);
            const error = document.getElementById(errorId);
            if (input && error) {
                input.classList.add("error");
                error.textContent = message;
                error.classList.add("show");
            }
        }
        function clearError(inputId, errorId) {
            const input = document.getElementById(inputId);
            const error = document.getElementById(errorId);
            if (input && error) {
                input.classList.remove("error");
                error.classList.remove("show");
            }
        }
        function validateForm(name, contact, email, formPrefix) {
            let isValid = true;
            let nameId, contactId, emailId, nameErrorId, contactErrorId, emailErrorId;
            if (formPrefix === "floating") {
                nameId = "floatingName"; contactId = "floatingContact"; emailId = "floatingEmail";
                nameErrorId = "floatingNameError"; contactErrorId = "floatingContactError"; emailErrorId = "floatingEmailError";
            } else if (formPrefix === "contact") {
                nameId = "contactName"; contactId = "contactMobile"; emailId = "contactEmail";
                nameErrorId = "contactNameError"; contactErrorId = "contactMobileError"; emailErrorId = "contactEmailError";
            } else if (formPrefix === "popup") {
                nameId = "popupName"; contactId = "popupContact"; emailId = "popupEmail";
                nameErrorId = "popupNameError"; contactErrorId = "popupContactError"; emailErrorId = "popupEmailError";
            }
            if (!name || name.trim() === "") { showError(nameId, nameErrorId, "Name is required"); isValid = false; } else { clearError(nameId, nameErrorId); }
            if (!contact || contact.trim() === "") { showError(contactId, contactErrorId, "Mobile number is required"); isValid = false; } else if (!validateMobile(contact)) { showError(contactId, contactErrorId, "Please enter a valid 10-digit mobile number"); isValid = false; } else { clearError(contactId, contactErrorId); }
            if (!email || email.trim() === "") { showError(emailId, emailErrorId, "Email address is required"); isValid = false; } else if (!validateEmail(email)) { showError(emailId, emailErrorId, "Please enter a valid email address"); isValid = false; } else { clearError(emailId, emailErrorId); }
            return isValid;
        }
        const BROCHURE_PDF_URL = "/brochure/La_Vida_Bella_Brochure_Digital_Low_Res.pdf";
        function triggerBrochureDownload() {
            const link = document.createElement("a");
            link.href = BROCHURE_PDF_URL;
            link.download = "La_Vida_Bella_Brochure_Digital_Low_Res.pdf";
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        async function submitToGoogleSheet(formData, submitButton, formElement, submitOptions) {
            const scriptURL = "https://script.google.com/macros/s/AKfycbyP670paikqZHr-Kl0sMzslmEJTs8k3K7yw2cUFMl0mMaKetH3KE_gvEx1B6HyR_Yty/exec";
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = "<span class=\"btn-loader\"></span>Submitting...";
            try {
                await fetch(scriptURL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(formData) });
                setTimeout(() => {
                    localStorage.setItem("enquirySubmitted", "true");
                    formElement.reset();
                    formElement.querySelectorAll(".error-message").forEach((el) => el.classList.remove("show"));
                    formElement.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    const popup = document.getElementById("enquiryPopup");
                    if (popup && popup.classList.contains("show")) popup.classList.remove("show");
                    if (submitOptions?.downloadBrochureAfterSuccess) triggerBrochureDownload();
                    window.location.href = "/lavidabella/thanks";
                }, 500);
            } catch (err) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                alert("Something went wrong. Please try again.");
            }
        }
        function openEnquiryPopup() {
            const popup = document.getElementById("enquiryPopup");
            if (popup) { popup.classList.add("show"); document.body.style.overflow = "hidden"; }
        }
        function closeEnquiryPopup() {
            const popup = document.getElementById("enquiryPopup");
            if (popup) { popup.classList.remove("show"); document.body.style.overflow = ""; }
        }
        const floatingForm = document.getElementById("floatingContactForm");
        const contactForm = document.getElementById("contactSectionForm");
        const popupForm = document.getElementById("enquiryPopupForm");
        const downloadBtn = document.getElementById("downloadBrochureBtn");
        const mobileBtn = document.getElementById("mobileEnquiryBtn");
        const closeBtn = document.getElementById("closeEnquiryPopup");
        const popupOverlay = document.getElementById("enquiryPopup");
        const cleanups = [];
        const onFloatingSubmit = async function (e) {
            e.preventDefault();
            const name = document.getElementById("floatingName")?.value?.trim() || "";
            const contact = floatingPhoneRef.current;
            const email = document.getElementById("floatingEmail")?.value?.trim() || "";
            if (!validateForm(name, contact, email, "floating")) return;
            const verified = await verifyLandingLeadOtp(floatingLeadOtpRef.current, contact);
            if (!verified) { alert(getLandingOtpErrorMessage(floatingLeadOtpRef.current)); return; }
            const sb = this.querySelector("button[type=\"submit\"]");
            submitToGoogleSheet({ name, contact, email, message: document.getElementById("floatingMessage")?.value?.trim() || "", project: "", Date: new Date().toISOString() }, sb, this);
        };
        const onContactSubmit = async function (e) {
            e.preventDefault();
            const name = document.getElementById("contactName")?.value?.trim() || "";
            const contact = contactPhoneRef.current;
            const email = document.getElementById("contactEmail")?.value?.trim() || "";
            if (!validateForm(name, contact, email, "contact")) return;
            const verified = await verifyLandingLeadOtp(contactLeadOtpRef.current, contact);
            if (!verified) { alert(getLandingOtpErrorMessage(contactLeadOtpRef.current)); return; }
            const sb = this.querySelector("button[type=\"submit\"]");
            submitToGoogleSheet({ name, contact, email, message: document.getElementById("contactMessage")?.value?.trim() || "", project: "", Date: new Date().toISOString() }, sb, this);
        };
        const onPopupSubmit = async function (e) {
            e.preventDefault();
            const name = document.getElementById("popupName")?.value?.trim() || "";
            const contact = popupPhoneRef.current;
            const email = document.getElementById("popupEmail")?.value?.trim() || "";
            if (!validateForm(name, contact, email, "popup")) return;
            const verified = await verifyLandingLeadOtp(popupLeadOtpRef.current, contact);
            if (!verified) { alert(getLandingOtpErrorMessage(popupLeadOtpRef.current)); return; }
            const sb = this.querySelector("button[type=\"submit\"]");
            submitToGoogleSheet({ name, contact, email, message: document.getElementById("popupMessage")?.value?.trim() || "", project: "", Date: new Date().toISOString() }, sb, this, { downloadBrochureAfterSuccess: true });
        };
        if (floatingForm) { floatingForm.addEventListener("submit", onFloatingSubmit); cleanups.push(() => floatingForm.removeEventListener("submit", onFloatingSubmit)); }
        if (contactForm) { contactForm.addEventListener("submit", onContactSubmit); cleanups.push(() => contactForm.removeEventListener("submit", onContactSubmit)); }
        if (popupForm) { popupForm.addEventListener("submit", onPopupSubmit); cleanups.push(() => popupForm.removeEventListener("submit", onPopupSubmit)); }
        const onDownloadClick = (e) => { e.preventDefault(); openEnquiryPopup(); };
        const onMobileClick = (e) => { e.preventDefault(); openEnquiryPopup(); };
        if (downloadBtn) { downloadBtn.addEventListener("click", onDownloadClick); cleanups.push(() => downloadBtn.removeEventListener("click", onDownloadClick)); }
        if (mobileBtn) { mobileBtn.addEventListener("click", onMobileClick); cleanups.push(() => mobileBtn.removeEventListener("click", onMobileClick)); }
        if (closeBtn) { closeBtn.addEventListener("click", closeEnquiryPopup); cleanups.push(() => closeBtn.removeEventListener("click", closeEnquiryPopup)); }
        if (popupOverlay) { const onOverlayClick = (e) => { if (e.target === popupOverlay) closeEnquiryPopup(); }; popupOverlay.addEventListener("click", onOverlayClick); cleanups.push(() => popupOverlay.removeEventListener("click", onOverlayClick)); }
        let reopenTimer = null;
        let reopenInterval = null;
        if (localStorage.getItem("enquirySubmitted") !== "true") {
            reopenTimer = setTimeout(() => { if (localStorage.getItem("enquirySubmitted") !== "true" && popupOverlay && !popupOverlay.classList.contains("show")) openEnquiryPopup(); }, 5000);
            const startAutoReopen = () => {
                if (reopenInterval) clearInterval(reopenInterval);
                reopenInterval = setInterval(() => {
                    if (localStorage.getItem("enquirySubmitted") === "true") { clearInterval(reopenInterval); return; }
                    if (popupOverlay && !popupOverlay.classList.contains("show")) openEnquiryPopup();
                }, 1500000);
            };
            if (closeBtn) closeBtn.addEventListener("click", startAutoReopen);
            if (popupOverlay) popupOverlay.addEventListener("click", (e) => { if (e.target === popupOverlay) startAutoReopen(); });
        }
        return () => {
            cleanups.forEach((c) => c());
            if (reopenTimer) clearTimeout(reopenTimer);
            if (reopenInterval) clearInterval(reopenInterval);
        };
    }, []);

    return (
        <>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=AW-16457709652"
                strategy="afterInteractive"
            />
            <Script id="gtag-config-lavidabella-home" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'AW-16457709652');
                `}
            </Script>

            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container">
                    <a className="navbar-brand font-weight-bold text-white" href="#"><img src="/eldeco-la-vida-bella-images2/images/updated-logo.png" alt=""
                        className="updatedLogo" /></a>

                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarMenu">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item"><a className="nav-link text-white" href="#home">Home</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#overview">Overview</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#highlights">Highlights</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#amenities">Amenities</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#gallery">Gallery</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#floors-plan">Floor Plans</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#location">Location</a></li>

                            <li className="nav-item"><a className="nav-link text-white" href="#eldeco-group">Eldeco Group</a></li>
                            <li className="nav-item"><a className="nav-link text-white" href="#contact">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <section id="home" className="heroslider">
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <div className="mobile-slider"><img className="d-block w-100" src="/eldeco-la-vida-bella-images2/images/black-banner-img.jpg" alt="" /></div>
                        <div className="desktop-slider"><img className="d-block w-100" src="/eldeco-la-vida-bella-images2/images/eldeco-desktop-bbanner.jpg" alt="" /></div>

                        <div className="homeBannerContent">
                            <div className="homeBannerContentInner">
                                <div className="leftSideContainer">
                                    <div>
                                        <img src="/eldeco-la-vida-bella-images2/images/updated-logo2.png" className="lftImg" alt="" />
                                        <h1 style={{ margin: 0, padding: 0, fontFamily: "'Montserrat', sans-serif" }}>Sector 12, Greater Noida (West)</h1>
                                    </div>

                                    <div>
                                        <h2 style={{ margin: 0, padding: 0, fontFamily: "'Montserrat', sans-serif" }}>
                                            Where Space Meets Sophistication</h2>
                                        <h3 style={{ margin: 0, padding: 0, fontFamily: "'Montserrat', sans-serif" }}>
                                            4 BR Premium Residences</h3>
                                    </div>

                                    <div className="lftGreenBox">
                                        <p style={{ margin: 0, padding: 0, fontFamily: "'Montserrat', sans-serif" }}>
                                            Exclusive Payment Plan</p>
                                        <div className="innerBox">
                                            <div className="box">
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>30</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>:</p>
                                            </div>
                                            <div className="box">
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>30</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>:</p>
                                            </div>
                                            <div className="box">
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>30</p>
                                            </div>
                                            <div>
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>:</p>
                                            </div>
                                            <div className="box">
                                                <p style={{ fontFamily: "'Open Sans', sans-serif" }}>10</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rightSideContainer">
                                    <img src="/eldeco-la-vida-bella-images2/images/qr-code.png" alt="" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <div className="contact-box">

                <div className="contact-btn" id="toggleBtn">
                    <span>Contact With Us!</span>
                    <span className="icon" id="icon">+</span>
                </div>

                <div className="contact-form" id="contactForm">

                    <form id="floatingContactForm">
                        <input type="text" id="floatingName" placeholder="Name" required />
                        <div className="error-message" id="floatingNameError"
                            style={{ color: '#dc3545', fontSize: '12px', marginTop: -10, marginBottom: 10, display: 'none' }}>Name
                            is required</div>

                        <input type="tel" id="floatingContact" placeholder="Mobile Number" required value={floatingPhone} onChange={(e) => setFloatingPhone(e.target.value)} />
                        <div className="error-message" id="floatingContactError"
                            style={{ color: '#dc3545', fontSize: '12px', marginTop: -10, marginBottom: 10, display: 'none' }}>
                            Valid mobile number is required (10 digits)</div>
                        <LeadOtpFields
                            phone={floatingPhone}
                            otp={floatingLeadOtp.otp}
                            onOtpChange={floatingLeadOtp.setOtp}
                            otpSent={floatingLeadOtp.otpSent}
                            isVerified={floatingLeadOtp.isVerified}
                            sending={floatingLeadOtp.sending}
                            verifying={floatingLeadOtp.verifying}
                            error={floatingLeadOtp.error}
                            resendSeconds={floatingLeadOtp.resendSeconds}
                            onSendOtp={floatingLeadOtp.sendOtp}
                        />

                        <input type="email" id="floatingEmail" placeholder="Email Address" required />
                        <div className="error-message" id="floatingEmailError"
                            style={{ color: '#dc3545', fontSize: '12px', marginTop: -10, marginBottom: 10, display: 'none' }}>
                            Valid email address is required</div>

                        <textarea id="floatingMessage" placeholder="Your Message"></textarea>

                        <button type="submit" className="submit-btn">Schedule Site Visit</button>
                    </form>
                </div>

            </div>
            <button className="mobile-enquiry-btn" id="mobileEnquiryBtn">
                <span>Enquiry Now</span>
            </button>

            <section id="overview" className="overview-section container70">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="title-overview text-center">Overview</div>
                            <h2 className="text-center">Experience Luxury at Its Finest.</h2>
                            <p className="text-center width80">
                                Eldeco La Vida Bella brings you to the center of comfort and excitement in Greater Noida West.
                                Set amidst serene landscapes, it features five elegant towers with <strong>spacious 4BR premium
                                    residences</strong>. Enjoy seamless connectivity via the 130m Noida-Greater Noida Link Road
                                and smooth internal access with wide roads. Each home is equipped with all-weather air
                                conditioning and a grand 9-ft entrance door with digital lock, offering a perfect blend of
                                luxury and security.


                            </p>

                            <a href="#" className="download-btn mt-4" id="downloadBrochureBtn">
                                Download Brochure <img src="/eldeco-la-vida-bella-images2/images/downloan-icon.png" alt="" /></a>

                        </div>

                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="aboutboxes">

                                <div className="price-box-outer">
                                    <div className="price-box-gray"></div>
                                    <div className="price-box p-4 text-white">

                                        <div className="price-text1">
                                            <h5 className="font-weight-bold" style={{ lineHeight: '30px' }}>Spacious 4BR <span
                                                className="font-weight-normal">Premium
                                                Residences</span></h5>

                                            <p className="starting">Starting at</p>
                                            <h3>₹ 3.58 Cr* </h3>
                                        </div>

                                        <div className="price-text2">

                                            <h5 className="font-weight-bold mt-4">Discover Your Home Today!<span
                                                className="font-weight-normal"></span></h5>
                                            <p className="starting" style={{ textAlign: 'end', marginTop: 40 }}>*T&C Apply</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="about2img"><img src="/eldeco-la-vida-bella-images2/images/about2.jpg" alt="" /></div>


                                <div className="livebox-box-outer">
                                    <div className="livebox-box-gray"><img src="/eldeco-la-vida-bella-images2/images/about1.jpg" alt="" /></div>
                                    <div className="livebox-box p-4 text-white">

                                        <h3>live big <br /><strong>live b<img className="boldimg" src="/eldeco-la-vida-bella-images2/images/bold.png"
                                            alt="" />ld</strong></h3>
                                        <p><strong>Eldeco La Vida Bella</strong> rises along the city&apos;s vital connection where
                                            the Noida-Greater Noida Link Road keeps life following effortlessly.</p>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>


            <section id="highlights" className="highlights-section container70">
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">

                            <h2 className="text-center">Highlights</h2>

                            <ul className="highlights-list">

                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight1.png" alt="" />
                                    <p>Only 2 Apartments On Each Floor</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight2.png" alt="" />
                                    <p>360-Degree View with L-Shaped Balconies</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight3.png" alt="" />
                                    <p>Fewer People, <br /> More Serenity</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight4.png" alt="" />
                                    <p>75% Of Open Spaces</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight5.png" alt="" />
                                    <p>Over 35 + Amenities</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight6.png" alt="" />
                                    <p>All Weather Air Conditioning In All Rooms</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight7.png" alt="" />
                                    <p>9-Ft Entrance Door With Digital Lock</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight8.png" alt="" />
                                    <p>Floor To Floor 11 Ft Height</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight9.png" alt="" />
                                    <p>Double-Height, <br /> Air-Conditioned Lobby</p>
                                </li>
                                <li><img src="/eldeco-la-vida-bella-images2/images/highlight10.png" alt="" />
                                    <p>Rooftop swimming pool with loungers</p>
                                </li>


                            </ul>

                        </div>


                    </div>
                </div>
            </section>

            <section id="amenities" className="amenities-section container70">
                <div className="container">

                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                            <div className="mobile">
                                <div className="tabrighthdng">
                                    <h2>Amenities</h2>
                                    <p>Gated Luxury Living with Rooftop Pool, Clubhouse, Gym, Yoga/Meditation Zone, Kids&apos; Play
                                        Area, Sports Courts, and 24/7 Security.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 amenities-tabs">

                            <div className="tabsouter">

                                <div className="tableft">
                                    <div className="tableft-inner">


                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link active" id="amenities-tab1-tab" data-toggle="tab"
                                                    data-target="#amenitiestab1" type="button" role="tab" aria-controls="home"
                                                    aria-selected="true"><img className="amenity-icon" src="/eldeco-la-vida-bella-images2/images/amenity1.png"
                                                        alt="" />Badminton Court
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab2-tab" data-toggle="tab"
                                                    data-target="#amenitiestab2"
                                                    type="but```````````````````````````````````````````````1ton" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity2.png" alt="" />Cricket Pitch
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab3-tab" data-toggle="tab"
                                                    data-target="#amenitiestab3" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity3.png" alt="" />Party Hall
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab4-tab" data-toggle="tab"
                                                    data-target="#amenitiestab4" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity4.png" alt="" />Club Roof Top Swimming Pool
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab5-tab" data-toggle="tab"
                                                    data-target="#amenitiestab5" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity5.png" alt="" />Multipurpose Court
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab6-tab" data-toggle="tab"
                                                    data-target="#amenitiestab6" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity6.png" alt="" />Table Tennis
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab7-tab" data-toggle="tab"
                                                    data-target="#amenitiestab7" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity7.png" alt="" />Kid&apos;s Play Area
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>

                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab8-tab" data-toggle="tab"
                                                    data-target="#amenitiestab8" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity8.png" alt="" />Gym
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab9-tab" data-toggle="tab"
                                                    data-target="#amenitiestab9" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity9.png" alt="" />Billiards
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="amenities-tab10-tab" data-toggle="tab"
                                                    data-target="#amenitiestab10" type="button" role="tab"
                                                    aria-controls="profile" aria-selected="false"><img className="amenity-icon"
                                                        src="/eldeco-la-vida-bella-images2/images/amenity10.png" alt="" />Pickle Ball
                                                    <span className="active-arrow"><img src="/eldeco-la-vida-bella-images2/images/arrow-right-white.png"
                                                        alt="" /></span></button>
                                            </li>


                                        </ul>
                                    </div>
                                </div>

                                <div className="tabright">

                                    <div className="desktop">
                                        <div className="tabrighthdng">
                                            <h2>Amenities</h2>
                                            <p>Gated luxury living with rooftop pool, clubhouse, gym, yoga/meditation zone,
                                                kids’ play area, sports courts & 24×7-security.</p>
                                        </div>
                                    </div>

                                    <div className="tabs-content">
                                        <div className="tab-content" id="myTabContent">

                                            <div className="tab-pane fade show active" id="amenitiestab1" role="tabpanel"
                                                aria-labelledby="amenities-tab1-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/badminton-2.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab2" role="tabpanel"
                                                aria-labelledby="amenities-tab2-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/cricket-pitch.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab3" role="tabpanel"
                                                aria-labelledby="amenities-tab3-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/party-hall.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab4" role="tabpanel"
                                                aria-labelledby="amenities-tab4-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/badminton-court.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab5" role="tabpanel"
                                                aria-labelledby="amenities-tab5-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/multipurpose-court.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab6" role="tabpanel"
                                                aria-labelledby="amenities-tab6-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/table-tenis.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab7" role="tabpanel"
                                                aria-labelledby="amenities-tab7-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/kidsplay.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab8" role="tabpanel"
                                                aria-labelledby="amenities-tab8-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gym.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab9" role="tabpanel"
                                                aria-labelledby="amenities-tab9-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/billiards.jpg" alt="" />
                                            </div>

                                            <div className="tab-pane fade" id="amenitiestab10" role="tabpanel"
                                                aria-labelledby="amenities-tab10-tab">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/pickle-ball.jpg" alt="" />
                                            </div>



                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>


                    </div>

                </div>
            </section>


            <section id="gallery" className="gallery-section gallery viewbox_gallery">
                <div className="container">

                    <div className="row">
                        <div className="col-12">
                            <h2 className="text-center">Gallery</h2>
                            <div className="width80">
                                <p className="text-center">Step into modern luxury at Eldeco La Vida Bella, offering expansive 4BR
                                    residences in a serene, amenity-rich setting. Indulge in elegant interiors and rooftop
                                    living.
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="row no-gutters galleryrowminus">

                        <div className="col-12 col-md-5 twoheight">
                            <div className="row no-gutters">


                                <div className="col-6 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery1-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery1.jpg" alt="" /></a>
                                    </div>
                                </div>

                                <div className="col-6 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery2-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery2.jpg" alt="" /></a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="col-12 col-md-7">
                            <div className="row no-gutters">
                                <div className="col-8 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery3-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery3.jpg" alt="" /></a>
                                    </div>
                                </div>
                                <div className="col-4 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery4-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery4.jpg" alt="" /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="row no-gutters">

                        <div className="col-12 col-md-6 gallerycolheight">
                            <div className="row no-gutters">
                                <div className="col-4 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery5-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery5.jpg" alt="" /></a>
                                    </div>
                                </div>
                                <div className="col-8 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery6-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery6.jpg" alt="" /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">

                            <div className="row no-gutters">
                                <div className="col-6 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery7-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery7.jpg" alt="" /></a>
                                    </div>
                                </div>
                                <div className="col-6 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery8-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery8.jpg" alt="" /></a>
                                    </div>
                                </div>
                            </div>

                            <div className="row no-gutters">
                                <div className="col-12 item">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/gallery9-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/gallery9.jpg" alt="" /></a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>



                </div>
            </section>

            <section id="floors-plan" className="floor-plan-section viewbox_floorplan container70">
                <div className="container">

                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                            <div className="masterplan">
                                <h4>Master Plan</h4>
                                <div className="masterplanimg">
                                    <div className="gallerybox">
                                        <a href="/eldeco-la-vida-bella-images2/images/master-plan-large.jpg" className="thumbnail">
                                            <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/master-plan.jpg" alt="" /></a>
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8">
                            <div className="floorplan">
                                <h4>Floor Plans</h4>


                                <div className="floorplan-flex">
                                    <div className="item">
                                        <div className="gallerybox">
                                            <a href="/eldeco-la-vida-bella-images2/images/floor-plan-large.jpg" className="thumbnail">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/type4-1.jpg" alt="" /></a>
                                        </div>
                                    </div>

                                    <div className="item">
                                        <div className="gallerybox">
                                            <a href="/eldeco-la-vida-bella-images2/images/floor-plan2-large.jpg" className="thumbnail">
                                                <img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/type5-1.jpg" alt="" /></a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>


                </div>
            </section>


            <section id="location" className="location-section">
                <div className="container">

                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-5">
                            <div className="eldecolocation"><img className="img-fluid" src="/eldeco-la-vida-bella-images2/images/eldecolocation.png" alt="" /></div>
                        </div>

                        <div className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-7">
                            <h2>Location Advantage</h2>
                            <div className="eldecolocation-points">

                                <div className="row">

                                    <div className="col-12 col-md-4 mb-3 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon1.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                Noida special economic zone 30 mins away
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4 mb-3 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon2.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                The proposed Metro Station is 3 Km away
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4 mb-3 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon3.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                Knowledge park V just 5 mins drive
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4 mb-3 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon4.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                Well, connected via 130 meter Noida-Greater Noida link road
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4 mb-3 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon5.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                Multiple Super Speciality Hospitals within 7KM
                                            </p>
                                        </div>
                                    </div>

                                    <div className="col-12 col-md-4 mb-2 d-flex">
                                        <div className="icon-wrap">
                                            <img src="/eldeco-la-vida-bella-images2/images/location-icon6.png" alt="" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="feature-text">
                                                High Street Malls at a driving distance
                                            </p>
                                        </div>
                                    </div>

                                </div>


                                <div className="row">
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                        <div className="googlemap">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.21437529894!2d77.48150357549825!3d28.563324675702578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda848984351d03b%3A0xb86fe2ab0aa1f9a1!2sEldeco%20La%20Vida%20Bella!5e0!3m2!1sen!2sin!4v1764918125757!5m2!1sen!2sin"
                                                width="100%" height="250" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"></iframe>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </section>

            <section id="eldeco-group" className="eldeco-group-section container70" style={{ marginBottom: 40 }}>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">

                            <div className="about-developer-outer">
                                <div className="about-developer-text">

                                    <div className="row">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                                            <h3>A Legacy of Trust Since 1985.</h3>

                                            <p>The Eldeco Group has been at the forefront of real estate development since 1985,
                                                earning a reputation for timely delivery and uncompromising quality. With a
                                                presence across 20 cities in North India, the Group has successfully delivered
                                                over 200 projects, including integrated townships, high-rise residences,
                                                industrial estates, malls, and office spaces.
                                                With more than 30 projects currently under active development, Eldeco has
                                                delivered over 30 million sq. ft. of space and earned the trust of 30,000+
                                                satisfied customers.</p>
                                        </div>

                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                                            <div className="text-center"><img src="/eldeco-la-vida-bella-images2/images/updated-logo.png" style={{ width: 140 }}
                                                alt="" /></div>
                                        </div>

                                        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4">
                                            <div className="stats-grid">
                                                <div className="stat-box">
                                                    <h4>40+</h4>
                                                    <p className="mb-0">Years</p>
                                                </div>

                                                <div className="stat-box">
                                                    <h4>20+</h4>
                                                    <p className="mb-0">Cities</p>
                                                </div>

                                                <div className="stat-box">
                                                    <h4>200+</h4>
                                                    <p className="mb-0">Projects</p>
                                                </div>

                                                <div className="stat-box">
                                                    <h4>30000+</h4>
                                                    <p className="mb-0">Homes</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                </div>


                                <div className="about-developer">
                                    <img src="/eldeco-la-vida-bella-images2/images/building.png" className="img-fluid" alt="" />
                                </div>
                            </div>


                        </div>


                    </div>

                </div>
            </section>


            <section id="contact" className="contact-section visit-section">
                <div className="container">
                    <div className="row align-items-start">

                        <div className="col-12 col-md-12 col-lg-4">
                            <h2 className="visit-title">We’d Love to Show You Around!</h2>
                            <p className="visit-subtitle">Come Experience La Vida Bella Yourself</p>
                        </div>

                        <div className="col-12 col-md-12 col-lg-8">
                            <form id="contactSectionForm">
                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <input type="text" id="contactName" className="form-control custom-input"
                                            placeholder="Name" />
                                        <div className="error-message" id="contactNameError"
                                            style={{ color: '#dc3545', fontSize: '12px', marginTop: 5, display: 'none' }}>Name is
                                            required</div>
                                    </div>
                                    <div className="form-group col-md-4">
                                        <input type="text" id="contactMobile" className="form-control custom-input"
                                            placeholder="Mobile No." value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                                        <div className="error-message" id="contactMobileError"
                                            style={{ color: '#dc3545', fontSize: '12px', marginTop: 5, display: 'none' }}>Valid
                                            mobile number is required (10 digits)</div>
                                    </div>
                                    <div className="form-group col-md-4">
                                        <input type="email" id="contactEmail" className="form-control custom-input"
                                            placeholder="E-Mail Address" />
                                        <div className="error-message" id="contactEmailError"
                                            style={{ color: '#dc3545', fontSize: '12px', marginTop: 5, display: 'none' }}>Valid email
                                            address is required</div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <LeadOtpFields
                                        phone={contactPhone}
                                        otp={contactLeadOtp.otp}
                                        onOtpChange={contactLeadOtp.setOtp}
                                        otpSent={contactLeadOtp.otpSent}
                                        isVerified={contactLeadOtp.isVerified}
                                        sending={contactLeadOtp.sending}
                                        verifying={contactLeadOtp.verifying}
                                        error={contactLeadOtp.error}
                                        resendSeconds={contactLeadOtp.resendSeconds}
                                        onSendOtp={contactLeadOtp.sendOtp}
                                    />
                                </div>

                                <div className="form-group">
                                    <textarea rows="4" id="contactMessage" className="form-control custom-input"
                                        placeholder="Your Message"></textarea>
                                </div>

                                <button type="submit" className="btn submit-btn">Submit</button>
                            </form>
                        </div>

                    </div>
                </div>
            </section>

            <div className="enquiry-popup-overlay" id="enquiryPopup">
                <div className="enquiry-popup">
                    <div className="enquiry-popup-header">
                        <h3>Get Your Brochure</h3>
                        <button className="enquiry-popup-close" id="closeEnquiryPopup">&times;</button>
                    </div>
                    <div className="enquiry-popup-body">
                        <p style={{ marginBottom: 20, color: '#555', fontFamily: "'Open Sans', sans-serif" }}>Fill in your details
                            to download the brochure</p>
                        <form id="enquiryPopupForm" className="enquiry-popup-form">
                            <input type="text" id="popupName" placeholder="Name" required />
                            <div className="error-message" id="popupNameError">Name is required</div>

                            <input type="tel" id="popupContact" placeholder="Mobile Number" required value={popupPhone} onChange={(e) => setPopupPhone(e.target.value)} />
                            <div className="error-message" id="popupContactError">Valid mobile number is required (10 digits)</div>
                            <LeadOtpFields
                                phone={popupPhone}
                                otp={popupLeadOtp.otp}
                                onOtpChange={popupLeadOtp.setOtp}
                                otpSent={popupLeadOtp.otpSent}
                                isVerified={popupLeadOtp.isVerified}
                                sending={popupLeadOtp.sending}
                                verifying={popupLeadOtp.verifying}
                                error={popupLeadOtp.error}
                                resendSeconds={popupLeadOtp.resendSeconds}
                                onSendOtp={popupLeadOtp.sendOtp}
                            />

                            <input type="email" id="popupEmail" placeholder="Email Address" required />
                            <div className="error-message" id="popupEmailError">Valid email address is required</div>

                            <textarea id="popupMessage" rows="4" placeholder="Your Message"></textarea>

                            <button type="submit" className="submit-btn">Download Brochure</button>
                        </form>
                    </div>
                </div>
            </div>

            <footer className="project-footer">
                <div className="container text-center">

                    <img src="/eldeco-la-vida-bella-images2/images/barcode.png" alt="QR Code" className="qr-image" />

                    <p className="rera-text mt-3">
                        <strong>RERA NO.: UPRERAPRJ136219/04/2024</strong>
                        <a href="https://www.up-rera.in" target="_blank" rel="noopener noreferrer">www.up-rera.in</a>
                    </p>

                    <p className="disclaimer-text">
                        <strong>Disclaimer</strong> - The content and visuals in this advertisement are solely an artistic
                        rendering for illustrative purposes and are not to scale, it does not constitute a legal offer or forms
                        part of any legally binding agreement. The promoter of the project clarifies that the information
                        provided herein are indicative in nature. Intending purchasers are advised to verify all the details
                        independently with the respective sales team of promoter of the project regarding plans, specifications,
                        terms of sales and payments and other relevant details independently before making any purchase decision
                        regarding any unit in the project.
                    </p>

                    <p className="link-text">
                        <a href="#">Disclaimer</a> &nbsp; <a href="#">Privacy Policy</a>
                    </p>

                    <p className="copyright-text">
                        © Copyright 2026 Eldeco-la-vida-bella. All Rights Reserved.
                    </p>
                </div>
            </footer>

            {/* jQuery + Bootstrap loaded in layout.js */}


            {/* Navbar scroll & section tracking moved to useEffect */}
            <script style={{ display: 'none' }}>
                {/* Placeholder - logic in useEffect */}
                {/* sections e.g. Amenities) don’t stay active after jumping to Gallery or */}
            </script>


            {/* openCity tab logic runs in useEffect above (window.openCity) */}

            {/* Amenities tab + gallery/floor viewbox logic runs in useEffect above */}

            {/* Owl, SelectOrDie, Custom loaded in layout.js */}

            {/* #floorplan-carousel owlCarousel runs in useEffect above */}
            {/* Contact box toggle runs in useEffect above */}

            <style dangerouslySetInnerHTML={{
                __html: `
        .btn-loader {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        /* Popup Modal Styles */
        .enquiry-popup-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }

        .enquiry-popup-overlay.show {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes slideDown {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .enquiry-popup {
            background: #fff;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: slideDown 0.3s ease;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .enquiry-popup-header {
            background: #008f3c;
            color: #fff;
            padding: 20px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .enquiry-popup-header h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            font-family: "Montserrat", sans-serif;
        }

        .enquiry-popup-close {
            background: transparent;
            border: none;
            color: #fff;
            font-size: 28px;
            cursor: pointer;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }

        .enquiry-popup-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .enquiry-popup-body {
            padding: 30px;
        }

        .enquiry-popup-form input,
        .enquiry-popup-form textarea {
            width: 100%;
            padding: 12px 15px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            font-family: "Open Sans", sans-serif;
            transition: border-color 0.3s;
        }

        .enquiry-popup-form input:focus,
        .enquiry-popup-form textarea:focus {
            outline: none;
            border-color: #008f3c;
        }

        .enquiry-popup-form input.error,
        .enquiry-popup-form textarea.error {
            border-color: #dc3545;
        }

        .error-message {
            color: #dc3545;
            font-size: 14px;
            margin-top: -10px;
            margin-bottom: 10px;
            display: none;
            font-family: "Open Sans", sans-serif;
        }

        .error-message.show {
            display: block;
        }

        .enquiry-popup-form .submit-btn {
            width: 100%;
            margin-top: 10px;
        }

        /* Error styles for other forms */
        #floatingContactForm input.error,
        #floatingContactForm textarea.error,
        #contactSectionForm input.error,
        #contactSectionForm textarea.error {
            border-color: #dc3545;
        }

        #floatingContactForm .error-message,
        #contactSectionForm .error-message {
            color: #dc3545;
            font-size: 12px;
            margin-top: -10px;
            margin-bottom: 10px;
            display: none;
            font-family: "Open Sans", sans-serif;
        }

        #contactSectionForm .error-message {
            margin-top: 5px;
        }

        #floatingContactForm .error-message.show,
        #contactSectionForm .error-message.show {
            display: block;
        }

        /* Mobile Enquiry Now Button */
        .mobile-enquiry-btn {
            display: none;
            position: fixed;
            right: -62px;
            top: 50%;
            transform: translateY(-50%) rotate(-90deg);
            transform-origin: center;
            background: #008f3c;
            color: #fff;
            border: none;
            padding: 12px 15px;
            border-radius: 0;
            font-size: 16px;
            font-weight: 500;
            font-family: "Montserrat", sans-serif;
            cursor: pointer;
            z-index: 9999;
            box-shadow: -4px 0 15px rgba(0, 143, 60, 0.4);
            transition: all 0.3s ease;
            letter-spacing: 1px;
            white-space: nowrap;
            line-height: 1.2;
            text-transform: uppercase;
        }

        .mobile-enquiry-btn:hover {
            background: #007a33;
            box-shadow: -6px 0 20px rgba(0, 143, 60, 0.5);
            transform: translateY(-50%) rotate(-90deg) scale(1.05);
        }

        .mobile-enquiry-btn:active {
            transform: translateY(-50%) rotate(-90deg) scale(0.95);
        }

        .mobile-enquiry-btn span {
            display: inline-block;
        }

        @media (max-width: 768px) {
            .mobile-enquiry-btn {
                display: block;
            }
        }

        @media (max-width: 768px) {
            .enquiry-popup {
                max-width: 95%;
                margin: 10px;
            }

            .enquiry-popup-header {
                padding: 15px;
            }

            .enquiry-popup-header h3 {
                font-size: 20px;
            }

            .enquiry-popup-body {
                padding: 20px;
            }
        }
    ` }} />

            {/* Form validation and submit handlers run in useEffect above */}

        </>
    )
}

export default Home;