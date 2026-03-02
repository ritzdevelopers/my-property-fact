"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import "./dashboard/dashboard.css";
import Image from "next/image";
import Cookies from "js-cookie";
import { LoadingSpinner } from "@/app/(home)/contact-us/page";
import { toast } from "react-toastify";

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showLoading, setShowLoading] = useState(false);
  const [buttonName, setButtonName] = useState("Go to dashboard");
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    // Prefetch dashboard route for faster navigation
    router.prefetch("/admin/dashboard");
  }, [router]);

  // Check for access denied query parameter and show toast (only after mount)
  useEffect(() => {
    if (!mounted) return;
    
    const accessDenied = searchParams?.get("accessDenied");
    if (accessDenied === "true") {
      toast.error("You don't have authority to access this page. Super Admin access required.");
      // Clean up the URL by removing the query parameter
      router.replace("/admin", { scroll: false });
    }
  }, [mounted, searchParams, router]);
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    try {
      setShowLoading(true);
      setButtonName("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}auth/login`,
        formData,
        { withCredentials: true } // Ensure cookies are included in the request
      );
      if (response.status === 200) {
        router.replace("/admin/dashboard");
        return;
      }
    } catch (error) {
      toast.error("Invalid username or password!");
      setShowLoading(false);
      setButtonName("Go to dashboard");
    }finally{
      setShowLoading(false);
      setButtonName("Go to dashboard");
    }
  };

  //Setting form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card p-5 border border-success">
          <h3 className="text-center mb-4">
            <Image
              height={100}
              width={100}
              alt="project-logo"
              src="/logo.webp"
            />
          </h3>
          <form
            noValidate
            className={validated ? "was-validated" : ""}
            onSubmit={handleSubmit}
            suppressHydrationWarning
          >
            <div className="form-group mb-4">
              <input
                type="email"
                className="form-control border border-success"
                id="exampleInputEmail1"
                name="email"
                aria-describedby="emailHelp"
                placeholder="Username or email"
                value={formData.email}
                onChange={handleChange}
                required
                suppressHydrationWarning
                autoComplete="email"
              />
              <div className="invalid-feedback">Enter a valid username!</div>
            </div>
            <div className="form-group mb-4">
              <input
                type="password"
                className="form-control border border-success"
                id="exampleInputPassword1"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                suppressHydrationWarning
                autoComplete="current-password"
              />
              <div className="invalid-feedback">Enter a valid password!</div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-success"
                disabled={showLoading}
                suppressHydrationWarning
              >
                {buttonName} <LoadingSpinner show={showLoading} />
              </button>
            </div>
            <div className="text-center mt-2">
              <Link className="text-dark text-decoration-none" href="#">
                Forget Password?
              </Link>
            </div>
            <div className="text-center mt-2">
              <Link className="text-dark text-decoration-none" href="#">
                Register?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card p-5 border border-success">
          <h3 className="text-center mb-4">
            <Image
              height={100}
              width={100}
              alt="project-logo"
              src="/logo.webp"
            />
          </h3>
          <div className="text-center">
            <LoadingSpinner show={true} />
          </div>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
