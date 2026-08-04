"use client";
import { Suspense } from "react";
import "./admin-globals.css";
import "./admin-auth.css";
import { LoginForm } from "@/components/admin/auth/login-form";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="mpf-zoho-login">
      <div className="mpf-zoho-login__card" style={{ minHeight: 320, placeItems: "center", display: "grid" }}>
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: "#8fa63a" }} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
      <Toaster />
    </>
  );
}
