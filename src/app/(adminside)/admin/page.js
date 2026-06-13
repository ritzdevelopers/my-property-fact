"use client";
import { Suspense } from "react";
import "./admin-globals.css";
import { LoginForm } from "@/components/admin/auth/login-form";
import { Toaster } from "@/components/ui/toaster";
import { Building2, Loader2 } from "lucide-react";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="h-7 w-7" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
