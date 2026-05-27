"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";

const HOME = "/lavidabella";
const IMG = "/eldeco-la-vida-bella-images2/images";

const thanksStyles = `
.thanks-section {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100px 0 60px;
    background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
}
.thanks-container {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 40px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.thanks-icon {
    width: 100px;
    height: 100px;
    margin: 0 auto 30px;
    background: #008f3c;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: thanksScaleIn 0.5s ease-out;
}
.thanks-icon i {
    font-size: 50px;
    color: #fff;
}
@keyframes thanksScaleIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
.thanks-title {
    font-size: 36px;
    font-weight: 800;
    color: #000;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
}
.thanks-message {
    font-size: 18px;
    color: #555;
    margin-bottom: 30px;
    line-height: 1.6;
    font-family: "Open Sans", sans-serif;
}
.thanks-redirect-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    border-left: 4px solid #008f3c;
}
.thanks-redirect-timer {
    font-size: 24px;
    font-weight: 700;
    color: #008f3c;
    margin: 10px 0;
    font-family: "Montserrat", sans-serif;
}
.thanks-redirect-text {
    font-size: 16px;
    color: #666;
    margin-top: 10px;
    font-family: "Open Sans", sans-serif;
}
.thanks-redirect-btn {
    background: #008f3c;
    color: #fff;
    padding: 14px 50px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 18px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    font-family: "Montserrat", sans-serif;
}
.thanks-redirect-btn:hover {
    background: #007a33;
    color: #fff;
    text-decoration: none;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 143, 60, 0.3);
}
@media (max-width: 768px) {
    .thanks-container { padding: 30px 20px; margin: 20px; }
    .thanks-title { font-size: 28px; }
    .thanks-message { font-size: 16px; }
    .thanks-redirect-timer { font-size: 20px; }
}
`;

export default function Thanks() {
    const [countdown, setCountdown] = useState(5);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (countdown !== 0) return;
        window.location.href = HOME;
    }, [countdown]);

    useEffect(() => {
        const $ = window.jQuery;
        if (!$) return;
        const onScroll = () => {
            if ($(window).scrollTop() > 50) {
                $(".navbar").addClass("scrolled");
                $(".nav-link, .navbar-brand").removeClass("text-white").addClass("text-dark");
            } else {
                $(".navbar").removeClass("scrolled");
                $(".nav-link, .navbar-brand").removeClass("text-dark").addClass("text-white");
            }
        };
        $(window).on("scroll", onScroll);
        return () => $(window).off("scroll", onScroll);
    }, []);

    return (
        <>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=AW-16457709652"
                strategy="afterInteractive"
            />
            <Script id="gtag-config-lavidabella-thanks" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'AW-16457709652');
                `}
            </Script>
            {/* Event snippet for Submit lead form (2) conversion page */}
            <Script id="gtag-conversion-submit-lead-thanks" strategy="afterInteractive">
                {`
                    gtag('event', 'conversion', {'send_to': 'AW-17892647835/MGkvCLi52YscEJvH8NNC'});
                `}
            </Script>
            <style dangerouslySetInnerHTML={{ __html: thanksStyles }} />
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container">
                    <Link className="navbar-brand font-weight-bold text-white" href={HOME}>
                        <img src={`${IMG}/updated-logo.png`} title="Eldeco" alt="Eldeco" className="updatedLogo" />
                    </Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarMenu" aria-label="Toggle menu">
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarMenu">
                        <ul className="navbar-nav ml-auto">
                            <li className="nav-item"><Link className="nav-link text-white" title="Home" href={`${HOME}#home`}>Home</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Overview" href={`${HOME}#overview`}>Overview</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Highlights" href={`${HOME}#highlights`}>Highlights</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" href={`${HOME}#eldeco-group`}>Eldeco Group</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Amenities" href={`${HOME}#amenities`}>Amenities</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" href={`${HOME}#gallery`}>Gallery</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Floors Plan" href={`${HOME}#floors-plan`}>Floors Plan</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Location" href={`${HOME}#location`}>Location</Link></li>
                            <li className="nav-item"><Link className="nav-link text-white" title="Contact" href={`${HOME}#contact`}>Contact</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <section className="thanks-section">
                <div className="container">
                    <div className="thanks-container">
                        <div className="thanks-icon">
                            <i className="fa fa-check" aria-hidden="true" />
                        </div>
                        <h1 className="thanks-title">Thank You!</h1>
                        <p className="thanks-message">
                            Your enquiry has been successfully submitted. Our team will get back to you shortly.
                        </p>
                        <div className="thanks-redirect-info">
                            <p className="thanks-redirect-text">You will be redirected to the home page in</p>
                            <div className="thanks-redirect-timer" id="countdown">{countdown}</div>
                            <p className="thanks-redirect-text">seconds</p>
                        </div>
                        <Link href={HOME} className="thanks-redirect-btn" id="manualRedirect">
                            Go to Home Page
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="project-footer">
                <div className="container text-center">
                    <img src={`${IMG}/barcode.png`} alt="QR Code" title="QR Code" className="qr-image" />
                    <p className="rera-text mt-3">
                        <strong>RERA NO.: UPRERAPRJ136219/04/2024</strong>{" "}
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
                        <a href="#" title="Disclaimer">Disclaimer</a> &nbsp; <a href="#" title="Privacy Policy">Privacy Policy</a>
                    </p>
                    <p className="copyright-text">
                        © Copyright 2025 Eldeco-la-vida-bella. All Right Reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
