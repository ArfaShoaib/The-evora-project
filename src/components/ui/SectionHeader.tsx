import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {/* Gold accent line */}
      <div className="w-12 h-0.5 bg-[#D4AF37]" />

      {/* Title */}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm sm:text-base text-[#B0B0B0] max-w-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
