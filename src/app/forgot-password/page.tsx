import { ForgotPassword } from "@/components/pages/auth/forgot-password";
import { authProviderServer } from "@/providers/auth-provider/auth-provider.server";
import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}

async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
}
