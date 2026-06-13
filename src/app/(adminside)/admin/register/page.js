import { RegisterForm } from "@/components/admin/auth/register-form";
import { Toaster } from "@/components/ui/toaster";

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
