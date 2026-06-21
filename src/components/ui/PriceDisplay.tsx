import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/context/currency-context";

interface PriceDisplayProps {
  price: number;
  salePrice: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  price,
  salePrice,
  className,
  size = "sm",
}: PriceDisplayProps) {
  const { formatPrice } = useCurrency();

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className={cn("flex items-center gap-2", className)} suppressHydrationWarning>
      {salePrice ? (
        <>
          <span
            className={cn(
              "font-semibold text-[#D4AF37]",
              sizeClasses[size]
            )}
            suppressHydrationWarning
          >
            {formatPrice(salePrice)}
          </span>
          <span
            className={cn(
              "text-[#B0B0B0] line-through",
              sizeClasses[size]
            )}
            suppressHydrationWarning
          >
            {formatPrice(price)}
          </span>
        </>
      ) : (
        <span
          className={cn(
            "font-semibold text-black",
            sizeClasses[size]
          )}
          suppressHydrationWarning
        >
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
