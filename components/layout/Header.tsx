"use client";

import Image from "next/image";
import NextLink from "next/link";
import logo from "@/assets/image/logo_2.png";
import {
  Button,
  Drawer,
  IconChevronDown,
  IconSearch,
  Popover,
  Surface,
  buttonVariants,
  cn,
  linkVariants,
  useOverlayState,
} from "@heroui/react";

const categoryColumns = [
  {
    id: "nam",
    title: "Nam",
    href: "/danh-muc/nam",
    items: [
      { label: "Áo nam", href: "/danh-muc/ao-nam" },
      { label: "Quần nam", href: "/danh-muc/quan-nam" },
      { label: "Phụ kiện nam", href: "/danh-muc/phu-kien-nam" },
    ],
  },
  {
    id: "nu",
    title: "Nữ",
    href: "/danh-muc/nu",
    items: [
      { label: "Áo nữ", href: "/danh-muc/ao-nu" },
      { label: "Quần nữ", href: "/danh-muc/quan-nu" },
      { label: "Phụ kiện nữ", href: "/danh-muc/phu-kien-nu" },
    ],
  },
  {
    id: "tre-em",
    title: "Trẻ em",
    href: "/danh-muc/tre-em",
    items: [
      { label: "Áo trẻ em", href: "/danh-muc/ao-tre-em" },
      { label: "Quần trẻ em", href: "/danh-muc/quan-tre-em" },
      { label: "Phụ kiện trẻ em", href: "/danh-muc/phu-kien-tre-em" },
    ],
  },
] as const;

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CategoryMenu({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const slots = linkVariants();

  return (
    <nav className={cn("flex flex-col gap-6", className)}>
      {categoryColumns.map((column) => (
        <div key={column.id}>
          <NextLink
            href={column.href}
            onClick={() => onNavigate?.()}
            className={cn(
              slots.base(),
              "text-base font-semibold not-italic no-underline",
            )}
          >
            {column.title}
          </NextLink>
          <ul className="mt-2 flex flex-col gap-1">
            {column.items.map((item) => (
              <li key={item.href}>
                <NextLink
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    slots.base(),
                    "block rounded-lg px-3 py-2 text-sm font-medium not-italic no-underline hover:bg-default-100",
                  )}
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CategoryPopover() {
  const slots = linkVariants();

  return (
    <Popover>
      <Button variant="outline" className="gap-1.5">
        Danh mục
        <IconChevronDown className="size-4" />
      </Button>
      <Popover.Content placement="bottom start" className="w-[min(90vw,640px)]">
        <Popover.Dialog>
          <div className="grid grid-cols-3 gap-6">
            {categoryColumns.map((column) => (
              <div key={column.id}>
                <NextLink
                  href={column.href}
                  className={cn(
                    slots.base(),
                    "text-base font-semibold not-italic no-underline",
                  )}
                >
                  {column.title}
                </NextLink>
                <ul className="mt-3 flex flex-col gap-1">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <NextLink
                        href={item.href}
                        className={cn(
                          slots.base(),
                          "block rounded-lg px-2 py-1.5 text-sm font-medium not-italic no-underline hover:bg-default-100",
                        )}
                      >
                        {item.label}
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function IconNavLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      href={href}
      aria-label={label}
      className={buttonVariants({
        variant: "ghost",
        isIconOnly: true,
        size: "md",
      })}
    >
      {children}
    </NextLink>
  );
}

export default function Header() {
  const categoryDrawerState = useOverlayState();

  return (
    <Surface
      variant="transparent"
      className="sticky top-0 z-50 border-b border-separator bg-background/80 not-italic backdrop-blur-md"
      render={(props) => <header {...props} className={cn(props.className, "relative")} />}
    >
      {/* Logo căn giữa màn hình */}
      <NextLink
        href="/"
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        aria-label="NA PHÙNG STORE"
      >
        <Image
          src={logo}
          alt="NA PHÙNG STORE"
          priority
          className="h-12 w-auto object-contain sm:h-12 md:h-13"
        />
      </NextLink>

      <div className="pointer-events-none relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Trái: Danh mục */}
        <div className="pointer-events-auto relative z-10 flex items-center">
          <div className="hidden md:block">
            <CategoryPopover />
          </div>

          <div className="md:hidden">
            <Drawer state={categoryDrawerState}>
              <Button
                variant="ghost"
                isIconOnly
                size="md"
                aria-label="Mở danh mục"
              >
                <MenuIcon className="size-5" />
              </Button>
              <Drawer.Backdrop>
                <Drawer.Content placement="left" className="w-[min(85vw,280px)]">
                  <Drawer.Dialog>
                    <Drawer.CloseTrigger />
                    <Drawer.Header>
                      <Drawer.Heading>Danh mục</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body>
                      <CategoryMenu onNavigate={categoryDrawerState.close} />
                    </Drawer.Body>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          </div>
        </div>

        {/* Phải: Tìm kiếm, giỏ hàng, đăng nhập */}
        <div className="pointer-events-auto relative z-10 flex items-center justify-end gap-1 sm:gap-2">
          <IconNavLink href="/tim-kiem" label="Tìm kiếm">
            <IconSearch className="size-5" />
          </IconNavLink>

          <IconNavLink href="/gio-hang" label="Giỏ hàng">
            <CartIcon className="size-5" />
          </IconNavLink>

          <NextLink
            href="/dang-nhap"
            className={cn(
              buttonVariants({ variant: "ghost", size: "md" }),
              "gap-1.5 not-italic",
            )}
          >
            <UserIcon className="size-5 shrink-0" />
            <span className="hidden text-sm font-medium sm:inline">Đăng nhập</span>
          </NextLink>
        </div>
      </div>
    </Surface>
  );
}
