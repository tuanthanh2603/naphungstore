"use client";

import {
  ArrowUpRightIcon,
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import NextLink from "next/link";
import logo from "@/assets/image/logo_2.png";
import {
  Button,
  Disclosure,
  Drawer,
  Popover,
  Surface,
  buttonVariants,
  cn,
  linkVariants,
  useOverlayState,
} from "@heroui/react";
import type {
  HeaderCategoryColumn,
  HeaderCategoryItem,
} from "@/types/store/category";

function CategoryItemRow({
  item,
  itemClassName,
  childClassName,
  onNavigate,
}: {
  item: HeaderCategoryItem;
  itemClassName: string;
  childClassName: string;
  onNavigate?: () => void;
}) {
  const slots = linkVariants();

  if (!item.children?.length) {
    return (
      <NextLink
        href={item.href}
        onClick={() => onNavigate?.()}
        className={cn(
          slots.base(),
          "block not-italic no-underline",
          itemClassName,
        )}
      >
        {item.label}
      </NextLink>
    );
  }

  return (
    <Disclosure>
      <Disclosure.Heading>
        <Disclosure.Trigger
          className={cn(
            "flex w-full cursor-pointer items-center justify-between not-italic",
            itemClassName,
          )}
        >
          {item.label}
          <Disclosure.Indicator />
        </Disclosure.Trigger>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Disclosure.Body className="flex flex-col gap-1 ps-3 pt-1">
          {item.children.map((child) => (
            <NextLink
              key={child.id}
              href={child.href}
              onClick={() => onNavigate?.()}
              className={cn(
                slots.base(),
                "block not-italic no-underline",
                childClassName,
              )}
            >
              {child.label}
            </NextLink>
          ))}
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}

function CategoryMenu({
  categories,
  className,
  onNavigate,
}: {
  categories: HeaderCategoryColumn[];
  className?: string;
  onNavigate?: () => void;
}) {
  const slots = linkVariants();

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted">Chưa có danh mục.</p>
    );
  }

  return (
    <nav className={cn("flex flex-col gap-6", className)}>
      {categories.map((column) => (
        <div key={column.id}>
          <NextLink
            href={column.href}
            onClick={() => onNavigate?.()}
            className={cn(
              slots.base(),
              "flex items-center justify-between gap-2 text-base font-semibold uppercase not-italic no-underline",
            )}
          >
            {column.title}
            <ArrowUpRightIcon className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </NextLink>
          <ul className="mt-2 flex flex-col gap-1">
            {column.items.map((item) => (
              <li key={item.id}>
                <CategoryItemRow
                  item={item}
                  itemClassName="rounded-lg px-3 py-2 text-sm font-medium hover:bg-default-100"
                  childClassName="rounded-lg px-3 py-2 text-sm text-muted hover:bg-default-100 hover:text-foreground"
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CategoryThumb({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const frameClassName = "size-12 shrink-0 rounded-lg bg-default-100 object-cover";

  if (!src) {
    return (
      <span
        className={cn(frameClassName, "flex items-center justify-center text-xs text-muted")}
        aria-hidden="true"
      >
        —
      </span>
    );
  }

  if (src.includes("res.cloudinary.com")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={48}
        height={48}
        className={frameClassName}
      />
    );
  }

  return <img src={src} alt={alt} className={frameClassName} />;
}

function DesktopCategoryItem({ item }: { item: HeaderCategoryItem }) {
  const slots = linkVariants();
  const thumb = <CategoryThumb src={item.imageUrl} alt={item.label} />;

  if (!item.children.length) {
    return (
      <NextLink
        href={item.href}
        className={cn(
          slots.base(),
          "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium leading-none not-italic no-underline hover:bg-default-100",
        )}
      >
        {thumb}
        <span className="flex min-h-12 items-center">{item.label}</span>
      </NextLink>
    );
  }

  return (
    <Disclosure>
      <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
        <NextLink href={item.href} className="flex size-12 shrink-0 items-center">
          {thumb}
        </NextLink>
        <Disclosure.Heading className="min-w-0 flex-1">
          <Disclosure.Trigger
            className={cn(
              "flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 py-0 text-sm font-medium leading-none not-italic",
            )}
          >
            {item.label}
            <Disclosure.Indicator />
          </Disclosure.Trigger>
        </Disclosure.Heading>
      </div>
      <Disclosure.Content>
        <Disclosure.Body className="flex flex-col gap-1 pb-1 ps-[3.75rem] pt-0">
          {item.children.map((child) => (
            <NextLink
              key={child.id}
              href={child.href}
              className={cn(
                slots.base(),
                "block rounded-lg px-2 py-1.5 text-sm text-muted not-italic no-underline hover:bg-default-100 hover:text-foreground",
              )}
            >
              {child.label}
            </NextLink>
          ))}
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}

function CategoryPopover({
  categories = [],
}: {
  categories?: HeaderCategoryColumn[];
}) {
  const slots = linkVariants();

  return (
    <Popover>
      <Button variant="outline" className="gap-1.5">
        Danh mục
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </Button>
      <Popover.Content placement="bottom start" className="w-[min(90vw,760px)]">
        <Popover.Dialog>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">Chưa có danh mục.</p>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((column) => (
              <div key={column.id}>
                <NextLink
                  href={column.href}
                  className={cn(
                    slots.base(),
                    "flex items-center justify-between gap-2 text-lg font-medium uppercase not-italic no-underline",
                  )}
                >
                  {column.title}
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted" aria-hidden="true" />
                </NextLink>
                <ul className="mt-3 flex flex-col gap-1">
                  {column.items.map((item) => (
                    <li key={item.id}>
                      <DesktopCategoryItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          )}
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

export default function Header({
  categories = [],
}: {
  categories?: HeaderCategoryColumn[];
}) {
  const categoryDrawerState = useOverlayState();

  return (
    <>
    <Surface
      variant="transparent"
      className="fixed inset-x-0 top-0 z-50 border-b border-separator bg-white not-italic"
      render={(props) => <header {...props} />}
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
            <CategoryPopover categories={categories} />
          </div>

          <div className="md:hidden">
            <Drawer state={categoryDrawerState}>
              <Button
                variant="ghost"
                isIconOnly
                size="md"
                aria-label="Mở danh mục"
              >
                <Bars3Icon className="size-5" aria-hidden="true" />
              </Button>
              <Drawer.Backdrop>
                <Drawer.Content placement="left" className="w-[min(85vw,280px)]">
                  <Drawer.Dialog>
                    <Drawer.CloseTrigger />
                    <Drawer.Header>
                      <Drawer.Heading>Danh mục</Drawer.Heading>
                    </Drawer.Header>
                    <Drawer.Body>
                      <CategoryMenu
                        categories={categories}
                        onNavigate={categoryDrawerState.close}
                      />
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
            <MagnifyingGlassIcon className="size-5" aria-hidden="true" />
          </IconNavLink>

          <IconNavLink href="/gio-hang" label="Giỏ hàng">
            <ShoppingBagIcon className="size-5" aria-hidden="true" />
          </IconNavLink>

          <IconNavLink href="/dang-nhap" label="Đăng nhập">
            <UserIcon className="size-5" aria-hidden="true" />
          </IconNavLink>
        </div>
      </div>
    </Surface>
    <div className="h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
