"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";

/**
 * Base UI reads text direction from its own context (default "ltr") rather than
 * the html `dir` attribute. Without this, RTL-aware components (Accordion, and
 * any future Menu / Select / Dialog) render left-to-right. Wrapping the tree in
 * a single DirectionProvider makes them all inherit RTL. Server-rendered
 * children pass straight through, so the page stays a Server Component.
 */
export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DirectionProvider direction="rtl">{children}</DirectionProvider>;
}
