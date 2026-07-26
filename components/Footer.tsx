import { Sprout } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const links = [
  { href: "#how", label: "چطوری کار می‌کنه" },
  { href: "#ai", label: "هوش مصنوعی" },
  { href: "#impact", label: "اثر اجتماعی" },
  { href: "#faq", label: "سؤالای پرتکرار" },
];

// نماد اعتماد الکترونیک (eNamad) — the seal/URL pair are issued per-site;
// both endpoints expect the same id + Code.
const ENAMAD_ID = "7039103";
const ENAMAD_CODE = "HOrPXAoVcoBgAZfwSy18FEtdxYSjLk1g";
const enamadHref = `https://trustseal.enamad.ir/?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;
const enamadLogoSrc = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD_ID}&Code=${ENAMAD_CODE}`;

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-50/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
              <Sprout className="size-6" />
              همراه
            </div>
            <p className="text-sm text-muted-foreground">
              هم‌سفری هوشمند برای یه شهر پاک‌تر
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-brand-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <Separator className="my-8 bg-brand-100" />

        <div className="flex flex-col items-center gap-5">
          <a
            referrerPolicy="origin"
            target="_blank"
            href={enamadHref}
            aria-label="نماد اعتماد الکترونیک"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- eNamad serves a dynamic tracking seal that must be loaded from their host as a plain <img>. */}
            <img
              referrerPolicy="origin"
              src={enamadLogoSrc}
              alt="نماد اعتماد الکترونیک"
              className="h-18 w-auto"
              style={{ cursor: "pointer" }}
              {...({ code: ENAMAD_CODE } as { code: string })}
            />
          </a>

          <p className="text-center text-sm text-muted-foreground">
            © ۱۴۰۵ همراه — ساخته‌شده با 💚 برای ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
