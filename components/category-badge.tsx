import type { ComponentProps, ReactElement } from "react";

import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  icon,
  color,
  selected = false,
  render,
  className,
  children,
  ...props
}: Omit<ComponentProps<"span">, "color"> & {
  icon: string;
  color: string;
  selected?: boolean;
  render?: ReactElement;
}) {
  return (
    <Badge
      variant="outline"
      render={render}
      className={cn(
        "h-auto gap-1.5 rounded-full border-transparent py-1 pr-3 pl-2 text-sm",
        className
      )}
      style={
        selected
          ? { backgroundColor: color, color: "#fff" }
          : { backgroundColor: `${color}26`, color }
      }
      {...props}
    >
      <CategoryIcon
        icon={icon}
        color={selected ? "#fff" : color}
        className="size-5 bg-transparent [&_svg]:size-3.5"
      />
      <span className={selected ? undefined : "text-foreground"}>
        {children}
      </span>
    </Badge>
  );
}
