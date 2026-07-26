import type { MetadataRoute } from "next";

// Web app manifest, served at `/manifest.webmanifest` by the Next.js file
// convention. This is what makes the site an installable PWA and what
// Bubblewrap consumes to build the TWA APK (see docs/TWA.md).
//
// When branding or icons change, regenerate the PNGs: `npm run pwa:icons`.
// Production origin: https://hamrah-ride.ir (per the Dockerfile).
export default function manifest(): MetadataRoute.Manifest {
  const icons: MetadataRoute.Manifest["icons"] = [
    // Same full-bleed asset is declared under both "any" and "maskable"
    // purposes — the icon's gradient fills the canvas edge-to-edge, so it
    // works on launchers that mask to a circle as well as those that don't.
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ];

  return {
    name: "همراه | هم‌سفری هوشمند برای شهری پاک‌تر",
    short_name: "همراه",
    description:
      "همراه با کمک هوش مصنوعی آدم‌های هم‌مسیر را به هم می‌رساند تا صندلی‌های خالی پر شوند، بنزین کمتری بسوزد و ترافیک سبک‌تر شود.",
    lang: "fa",
    dir: "rtl",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Matches app/globals.css `--background` (oklch(1 0 0)) so the TWA splash
    // doesn't flash a color the page never shows.
    background_color: "#ffffff",
    // Matches the themeColor in app/layout.tsx's viewport export (brand-700).
    theme_color: "#047857",
    categories: ["travel", "navigation", "social"],
    icons,
  };
}
