import {
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from "@/app/(app)/households/categories/_lib/category-style";
import { cn } from "@/lib/utils";

export function CategoryIcon({
  icon,
  color,
  className,
}: {
  icon: string;
  color: string;
  className?: string;
}) {
  const Icon =
    CATEGORY_ICONS[icon as keyof typeof CATEGORY_ICONS] ??
    CATEGORY_ICONS[DEFAULT_CATEGORY_ICON];
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        className
      )}
      style={{ backgroundColor: `${color}26`, color }}
    >
      <Icon className="size-4" />
    </span>
  );
}
