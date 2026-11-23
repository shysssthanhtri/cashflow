"use client";

import {
  ChartPieIcon,
  HistoryIcon,
  MenuIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const items = [
  { href: ROUTES.transactionsAdd, label: "Add", icon: PlusIcon },
  { href: ROUTES.transactions, label: "History", icon: HistoryIcon },
  { href: ROUTES.report, label: "Report", icon: ChartPieIcon },
  { href: ROUTES.budget, label: "Budget", icon: WalletIcon },
  { href: ROUTES.other, label: "Other", icon: MenuIcon },
];

export function MobileNav() {
  const pathname = usePathname();
  const activeHref = items
    .filter(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-full border border-white/30 bg-background/60 p-1.5 shadow-lg ring-1 shadow-black/10 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 md:hidden dark:border-white/10 dark:bg-background/40 dark:ring-white/5"
    >
      <ul className="flex items-center justify-between">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-auto w-full flex-col gap-0.5 rounded-full py-1.5 text-[10px]",
                  active
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
