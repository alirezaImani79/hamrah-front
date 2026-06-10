import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
};

/** Eyebrow + title + optional subtitle, used at the top of each section. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-start";

  return (
    <div className={`mx-auto flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow ? (
        <Badge
          variant="secondary"
          className="bg-brand-100 text-brand-700 hover:bg-brand-100"
        >
          {eyebrow}
        </Badge>
      ) : null}
      <h2 className="text-pretty text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-pretty text-lg leading-8 text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
