import Image from "next/image";
import NextLink from "next/link";
import logo from "@/assets/image/logo_2.png";

const links = [
  { href: "/#danh-muc", label: "Danh mục" },
  { href: "/#san-pham", label: "Sản phẩm" },
  { href: "/danh-muc", label: "Tất cả danh mục" },
  { href: "/tim-kiem", label: "Tìm kiếm" },
];

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <NextLink href="/" aria-label="NA PHÙNG STORE">
            <Image src={logo} alt="NA PHÙNG STORE" className="h-12 w-auto object-contain" />
          </NextLink>
          <p className="mt-5 max-w-sm text-sm leading-7 text-stone">
           NA PHÙNG STORE
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[11px] tracking-[0.22em] uppercase">
          {links.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className="text-ink no-underline transition-colors hover:text-gold"
            >
              {link.label}
            </NextLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-gold/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-[11px] tracking-[0.16em] text-stone uppercase sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()}</p>
          <p>Ho Chi Minh</p>
        </div>
      </div>
    </footer>
  );
}
