import localFont from "next/font/local";

/**
 * Bộ font SF Pro trong `fe/fonts/` bị gán nhãn ngược:
 * - file *Không* có "Italic" → glyph nghiêng (italicAngle -12°)
 * - file *Có* "Italic" → glyph thẳng (italicAngle 0°)
 * Chỉ load các file thẳng cho style: "normal".
 */
export const sfProText = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Text-UltralightItalic.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-ThinItalic.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-LightItalic.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-RegularItalic.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-MediumItalic.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-SemiboldItalic.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-BoldItalic.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-HeavyItalic.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Text-BlackItalic.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-text",
  display: "swap",
});

export const sfProDisplay = localFont({
  src: [
    {
      path: "../fonts/SF-Pro-Display-ThinItalic.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-LightItalic.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-RegularItalic.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-MediumItalic.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-SemiboldItalic.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-BoldItalic.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-HeavyItalic.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/SF-Pro-Display-BlackItalic.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
  display: "swap",
});
