import NextLink from "next/link";
import { Surface } from "@heroui/react";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const displayName = admin.fullName?.trim() || admin.username;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold not-italic">Tổng quan</h1>
        <p className="mt-1 text-muted">
          Xin chào {displayName}, chào mừng bạn đến trang quản trị NA PHÙNG STORE.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NextLink href="/admin/category" className="no-underline">
          <Surface className="rounded-2xl border border-separator p-5 transition-colors hover:bg-default-100/60">
            <h2 className="font-medium not-italic text-foreground">Danh mục</h2>
            <p className="mt-2 text-sm text-muted">Quản lý danh mục</p>
          </Surface>
        </NextLink>
        <Surface className="rounded-2xl border border-separator p-5">
          <h2 className="font-medium not-italic">Sản phẩm</h2>
          <p className="mt-2 text-sm text-muted">Quản lý sản phẩm.</p>
        </Surface>

        <Surface className="rounded-2xl border border-separator p-5">
          <h2 className="font-medium not-italic">Đơn hàng</h2>
          <p className="mt-2 text-sm text-muted">Theo dõi và xử lý đơn hàng.</p>
        </Surface>

        <Surface className="rounded-2xl border border-separator p-5">
          <h2 className="font-medium not-italic">Khách hàng</h2>
          <p className="mt-2 text-sm text-muted">Quản lý thông tin khách hàng.</p>
        </Surface>
      </div>
    </div>
  );
}
