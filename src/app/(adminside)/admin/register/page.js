import { RegisterForm } from "@/components/admin/auth/register-form";
import { Toaster } from "@/components/ui/toaster";
import "../admin-globals.css";
import "../admin-auth.css";

export const metadata = {
  title: "Create account | MPF Admin",
};

export default function AdminRegisterPage() {
  return (
    <>
      <RegisterForm />
      <Toaster />
    </>
  );
}
