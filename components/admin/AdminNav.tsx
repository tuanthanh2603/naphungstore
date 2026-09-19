"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@heroui/react";

const navItems = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/category", label: "Danh mục" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <NextLink
            key={item.href}
            href={item.href}
            className={cn(
              "not-italic no-underline transition-colors",
              isActive
                ? "font-semibold text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </NextLink>
        );
      })}
    </nav>
  );
}
