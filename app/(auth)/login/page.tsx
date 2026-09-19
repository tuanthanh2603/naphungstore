import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Đang tải...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
