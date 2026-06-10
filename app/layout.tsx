import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// Vazirmatn drives the whole UI font (Persian + Latin). Binding it to the
// --font-sans CSS variable means shadcn's `font-sans` / `font-heading` tokens
// resolve to it. next/font self-hosts the file at build time — no runtime
// dependency on Google. It also ships a variable weight axis, so no `weight`.
const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "همراه | هم‌سفری هوشمند برای شهری پاک‌تر",
  description:
    "همراه با کمک هوش مصنوعی آدم‌های هم‌مسیر را به هم می‌رساند تا صندلی‌های خالی پر شوند، بنزین کمتری بسوزد و ترافیک سبک‌تر شود. کاملاً داوطلبانه و غیرانتفاعی.",
  keywords: [
    "همراه",
    "هم‌سفری",
    "کارپولینگ",
    "هوش مصنوعی",
    "کاهش مصرف سوخت",
    "حمل و نقل هوشمند",
  ],
  openGraph: {
    title: "همراه | هم‌سفری هوشمند برای شهری پاک‌تر",
    description:
      "هر صندلی خالی یک فرصت است؛ با همراه هم‌مسیرت را پیدا کن و شهر را سبک‌تر کن.",
    locale: "fa_IR",
    type: "website",
  },
};

export const viewport: Viewport = {
  // Next 16 requires themeColor in the viewport export, not in metadata.
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
