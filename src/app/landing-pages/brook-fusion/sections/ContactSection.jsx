// "use client";

// export default function ContactSection() {
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("Submitting...");

//     try {
//       const response = await fetch(
//         "https://script.google.com/macros/s/AKfycbwFUrsuEzkLUjc07z9MXmKwKSb1zGNo8gCJrmNLI0mCqkhopIjdHYqzvT2zcTKMpqL7Xg/exec",
//         {
//           method: "POST",
//           body: JSON.stringify(formData),
//         }
//       );

//       const result = await response.json();
//       if (result.result === "success") {
//         setStatus("Form submitted successfully!");
//         router.push("/brook/thankyou");
//         setFormData({ name: "", email: "", phone: "", message: "" });
//       } else {
//         setStatus("Failed to submit. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setStatus("Submission error. Please try again later.");
//     }
//   };
//   return (
//     <section id="contact" className="bg-light py-5 px-3 text-center">
//       <div className="container position-relative z-1">
//         <h5 className="text-uppercase text-secondary fw-semibold mb-3">
//           Contact Us
//         </h5>
//         <h2 className="display-3 fw-bold text-dark mb-3">
//           Let’s Help You Find Your Perfect Home at The Brook
//         </h2>
//         <p className="lead text-muted mb-5">
//           Please fill in your details and our team will get in touch shortly.
//         </p>

//         <div
//           className="mx-auto bg-white rounded shadow p-2 p-md-3 border border-secondary"
//           style={{ maxWidth: "900px" }}
//         >
//           <form
//             className="border border-warning rounded p-5 p-md-5"
//             style={{ minHeight: "100px" }}
//           >
//             <div className="row g-4 mb-4">
//               <div className="col-md-4">
//                 <input
//                   type="text"
//                   placeholder="Name"
//                   className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
//                   required
//                 />
//               </div>
//               <div className="col-md-4">
//                 <input
//                   type="tel"
//                   placeholder="Phone Number"
//                   className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
//                   required
//                 />
//               </div>
//               <div className="col-md-4">
//                 <input
//                   type="email"
//                   placeholder="Email ID"
//                   className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-4">
//               <select
//                 required
//                 className="form-select form-select-lg rounded-0 border-0 border-bottom border-warning"
//               >
//                 <option value="">Preferred Unit Type</option>
//                 <option value="3bhk">3 BHK</option>
//                 <option value="4bhk">4 BHK</option>
//               </select>
//             </div>

//             <div className="mb-4">
//               <input
//                 type="text"
//                 placeholder="Message (Optional)"
//                 className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
//               />
//             </div>

//             <div className="text-center">
//               <button
//                 type="submit"
//                 className="btn btn-lg px-5 py-3 fw-semibold"
//               >
//                 Get In Touch
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       <style jsx>{`
//         input:focus,
//         select:focus {
//           border-color: #d0b674 !important;
//           box-shadow: 0 0 0 0.25rem rgba(208, 182, 116, 0.5) !important;
//           outline: none !important;
//         }

//         .form-control,
//         .form-select,
//         button {
//           border-color: #d0b674 !important;
//         }

//         button {
//           color: #d0b674 !important;
//           transition: color 0.3s, background-color 0.3s;
//         }

//         button:hover {
//           color: #fff !important;
//           background-color: #d0b674 !important;
//         }

//         #contact {
//           background: #fff !important;
//           margin-bottom: 5rem;
//         }
//       `}</style>
//     </section>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function ContactSection() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    unitType: "",
    message: "",
  });
  const leadOtp = useLeadOtp(formData.phone);

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verified = await verifyLandingLeadOtp(leadOtp, formData.phone);
    if (!verified) {
      setStatus(getLandingOtpErrorMessage(leadOtp));
      return;
    }

    setStatus("Submitting...");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbx4BfR6EITWPi0bnFPKlwLknP8vz2bdNiIv3mRHNklGeyfaaQyuNKGocZWSd738CrUy/exec",
        {
          method: "POST",

          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.result === "success") {
        setStatus("Form submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          unitType: "",
          message: "",
        });
        router.push("brook-fusion/thankyou");
      } else {
        setStatus("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Submission error. Please try again later.");
    }
  };

  return (
    <section id="contact" className="bg-light py-5 px-3 text-center">
      <div className="container position-relative z-1">
        <h5 className="text-uppercase text-secondary fw-semibold mb-3">
          Contact Us
        </h5>
        <h2 className="display-3 fw-bold text-dark mb-3">
          Let Us Help You Find Your Perfect Home at The Brook
        </h2>
        <p className="lead text-muted mb-5">
          Please fill in your details and our team will get in touch shortly.
        </p>

        <div
          className="mx-auto bg-white rounded shadow p-2 p-md-3 border border-secondary"
          style={{ maxWidth: "900px" }}
        >
          <form
            onSubmit={handleSubmit}
            className="border border-warning rounded p-5 p-md-5"
            style={{ minHeight: "100px" }}
          >
            <div className="row g-4 mb-4">
              <div className="col-md-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <LeadOtpFields
                phone={formData.phone}
                otp={leadOtp.otp}
                onOtpChange={leadOtp.setOtp}
                otpSent={leadOtp.otpSent}
                isVerified={leadOtp.isVerified}
                sending={leadOtp.sending}
                verifying={leadOtp.verifying}
                error={leadOtp.error}
                resendSeconds={leadOtp.resendSeconds}
                onSendOtp={leadOtp.sendOtp}
              />
            </div>

            <div className="mb-4">
              <select
                name="unitType"
                required
                className="form-select form-select-lg rounded-0 border-0 border-bottom border-warning"
                value={formData.unitType}
                onChange={handleChange}
              >
                <option value="">Preferred Unit Type</option>
                <option value="3bhk">3 BHK</option>
                <option value="4bhk">4 BHK</option>
              </select>
            </div>

            <div className="mb-4">
              <input
                type="text"
                name="message"
                placeholder="Message (Optional)"
                className="form-control form-control-lg rounded-0 border-0 border-bottom border-warning"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="btn btn-lg px-5 py-3 fw-semibold"
              >
                Get In Touch
              </button>
            </div>

            {status && (
              <p className="mt-4 text-secondary">
                <em>{status}</em>
              </p>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        input:focus,
        select:focus {
          border-color: #d0b674 !important;
          box-shadow: 0 0 0 0.25rem rgba(208, 182, 116, 0.5) !important;
          outline: none !important;
        }

        .form-control,
        .form-select,
        button {
          border-color: #d0b674 !important;
        }

        button {
          color: #d0b674 !important;
          transition: color 0.3s, background-color 0.3s;
        }

        button:hover {
          color: #fff !important;
          background-color: #d0b674 !important;
        }

        #contact {
          background: #fff !important;
          margin-bottom: 5rem;
        }
      `}</style>
    </section>
  );
}
