import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Page-width container vs. full bleed (for banners). */
  bleed?: boolean;
};

/** Consistent vertical rhythm + centered max-width container for every section. */
export default function Section({
  id,
  children,
  className = "",
  bleed = false,
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 py-20 sm:py-28 ${className}`}>
      <div className={bleed ? "" : "mx-auto w-full max-w-6xl px-5 sm:px-8"}>
        {children}
      </div>
    </section>
  );
}
