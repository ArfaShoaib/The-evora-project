import { cn } from "@/lib/utils";

interface StockStatusProps {
  stock: number;
}

export function StockStatus({ stock }: StockStatusProps) {
  const status =
    stock === 0
      ? { label: "Out of Stock", className: "text-red-500" }
      : stock <= 10
        ? { label: `Low Stock — ${stock} left`, className: "text-amber-500" }
        : { label: "In Stock", className: "text-emerald-500" };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-2 rounded-full", status.className === "text-red-500" ? "bg-red-500" : status.className === "text-amber-500" ? "bg-amber-500" : "bg-emerald-500")} />
      <span className={cn("text-sm font-medium", status.className)}>
        {status.label}
      </span>
    </div>
  );
}