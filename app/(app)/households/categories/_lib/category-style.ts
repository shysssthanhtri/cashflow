import {
  BriefcaseIcon,
  BusIcon,
  CarIcon,
  CoffeeIcon,
  GiftIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  type LucideIcon,
  PiggyBankIcon,
  PlaneIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  TagIcon,
  UtensilsIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react";

export const CATEGORY_ICONS = {
  tag: TagIcon,
  utensils: UtensilsIcon,
  coffee: CoffeeIcon,
  "shopping-bag": ShoppingBagIcon,
  home: HomeIcon,
  car: CarIcon,
  bus: BusIcon,
  plane: PlaneIcon,
  zap: ZapIcon,
  smartphone: SmartphoneIcon,
  "heart-pulse": HeartPulseIcon,
  "graduation-cap": GraduationCapIcon,
  gift: GiftIcon,
  briefcase: BriefcaseIcon,
  wallet: WalletIcon,
  "piggy-bank": PiggyBankIcon,
} as const satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_NAMES = Object.keys(
  CATEGORY_ICONS
) as CategoryIconName[];

export const CATEGORY_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
] as const;

export const DEFAULT_CATEGORY_ICON: CategoryIconName = "tag";
export const DEFAULT_CATEGORY_COLOR = "#64748b";
