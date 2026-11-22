"use client";

import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

const options = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

const subscribe = () => () => {};

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  return (
    <section>
      <h2 className="px-2 pb-2 text-xs font-medium text-muted-foreground uppercase">
        Theme
      </h2>
      <ul
        role="radiogroup"
        aria-label="Theme"
        className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5"
      >
        {options.map(({ value, label, icon: Icon }) => {
          const selected = mounted && theme === value;
          return (
            <li key={value} className="border-border/60 not-last:border-b">
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-foreground/10"
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{label}</span>
                {selected && <CheckIcon className="size-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export { ThemeSwitcher };
