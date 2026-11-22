"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/config/routes";

export type PeriodOption = { value: string; label: string };

export function PeriodSelector({
  value,
  options,
}: {
  value: string;
  options: PeriodOption[];
}) {
  const router = useRouter();

  return (
    <Select
      value={value}
      items={options}
      onValueChange={(id) => {
        if (id && id !== value) router.push(ROUTES.period(id as string));
      }}
    >
      <SelectTrigger className="w-full" aria-label="Period">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
