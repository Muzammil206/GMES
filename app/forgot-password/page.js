import ForgotPasswordPage from "@/components/forget-password";
import { Suspense } from "react";

export default function Page() {
  return (
     <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPage />
     </Suspense>
  );
}