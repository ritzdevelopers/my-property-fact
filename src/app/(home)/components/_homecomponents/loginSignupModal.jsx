"use client";

import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./loginSignup.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { extractAccessToken } from "@/lib/apiAuth";

export default function LoginSignupModal({ show, handleClose }) {
  const router = useRouter();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
    fullName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [receivedOTP, setReceivedOTP] = useState("");

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    // Send token to your Spring Boot backend for verification
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}app/auth/google`,
      {
        token: token,
      }
    );
    const googleToken = extractAccessToken(response.data);
    if (googleToken) {
      const token = googleToken;
      Cookies.set("userData", JSON.stringify(response.data), {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
      });
      Cookies.set("token", token, {
        expires: 7, // Token expires in 7 days
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Prevent CSRF issues
        path: "/", // Available across the site
      });
      router.push("/portal/dashboard");
      handleClose(false);
    }
  };

  const handleError = () => {
    // Google login failed - handled silently
  };

  // Handle manual phone number login/signup
  const handlePhoneAuth = async (isSignup = false) => {
    if (!formData.phoneNumber) {
      alert("Please enter your phone number");
      return;
    }

    // For signup, also require name
    if (isSignup && !formData.fullName) {
      alert("Please enter your full name");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/send-otp`,
        { phoneNumber: formData.phoneNumber }
      );

      if (response.data.success) {
        setShowOTP(true);
        // Store the OTP for development (will be removed in production)
        if (response.data.otp) {
          setReceivedOTP(response.data.otp);
          alert(`OTP sent! Your OTP is: ${response.data.otp} (Development only)`);
        } else {
          alert("OTP sent! Please check your phone.");
        }
      }
    } catch (error) {
      alert(
        "Error: " + (error.response?.data?.error || error.response?.data?.message || "Something went wrong")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerify = async (isSignup = false) => {
    if (!formData.otp) {
      alert("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    try {
      const requestData = {
        phoneNumber: formData.phoneNumber,
        otp: formData.otp,
      };

      // Add fullName for signup
      if (isSignup && formData.fullName) {
        requestData.fullName = formData.fullName;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}app/auth/verify-otp`,
        requestData
      );

      const accessToken = extractAccessToken(response.data);
      if (accessToken) {
        // Store token
        Cookies.set("token", accessToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/",
        });

        // Store refreshtoken
        Cookies.set("refreshToken", response.data.refreshToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          path: "/",
        });

        // Store user data
        if (response.data.user) {
          Cookies.set("userData", JSON.stringify(response.data.user), {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            path: "/",
          });
        }

        // Reset form and close modal
        setFormData({ phoneNumber: "", otp: "", fullName: "" });
        setShowOTP(false);
        setReceivedOTP("");
        handleClose(false);
        router.push("/portal/dashboard");
      }
    } catch (error) {
      alert("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered size="lg">
      <div
        className={`${styles.authWrapper} ${
          isRightPanelActive ? styles.rightPanelActive : ""
        }`}
        id="auth-container"
      >
        {/* Sign Up */}
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form>
            <h1>Create Account</h1>
            <div className={styles.socialContainer}>
              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              >
                <div className={styles.googleLoginButton}>
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    text="continue_with"
                  />
                </div>
              </GoogleOAuthProvider>
            </div>
            <span>or use your phone for registration</span>
            
            {/* Full Name field - only shown before OTP */}
            {!showOTP && (
              <input
                className="mb-3"
                type="text"
                placeholder="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            )}
            
            <input
              className="mb-3"
              type="tel"
              placeholder="Mobile Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={isLoading || showOTP}
            />
            {showOTP && (
              <>
                <input
                  className="mb-3"
                  type="text"
                  placeholder="Enter OTP"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={6}
                />
                {receivedOTP && (
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textAlign: 'center' }}>
                    OTP: <strong>{receivedOTP}</strong> (Development Mode Only)
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() =>
                showOTP ? handleOTPVerify(true) : handlePhoneAuth(true)
              }
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : showOTP ? "Verify OTP" : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Sign In */}
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form>
            <h1>Sign in</h1>
            <div className={`${styles.googleLoginButton} my-3`}>
              <GoogleOAuthProvider
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
              </GoogleOAuthProvider>
            </div>
            <span>or use your phone number to sign in</span>
            <input
              className="mb-3"
              type="tel"
              placeholder="Mobile Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={isLoading || showOTP}
            />
            {showOTP && (
              <>
                <input
                  className="mb-3"
                  type="text"
                  placeholder="Enter OTP"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={6}
                />
                {receivedOTP && (
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textAlign: 'center' }}>
                    OTP: <strong>{receivedOTP}</strong> (Development Mode Only)
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() =>
                showOTP ? handleOTPVerify(false) : handlePhoneAuth(false)
              }
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : showOTP ? "Verify OTP" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
