import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import logo from "@/assets/image/logo_2.png";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin | NA PHÙNG STORE",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const displayName = admin.fullName?.trim() || admin.username;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-separator bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <NextLink href="/admin" className="flex items-center gap-3 no-underline">
              <Image
                src={logo}
                alt="NA PHÙNG STORE"
                className="h-10 w-auto object-contain"
              />
              <span className="text-sm font-semibold not-italic text-foreground">
                Quản trị
              </span>
            </NextLink>
            <AdminNav />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm not-italic text-muted sm:inline">
              {displayName}
            </span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
