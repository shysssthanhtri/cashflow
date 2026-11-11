"use client";

import { switchHousehold } from "@/app/households/actions";

export function HouseholdSwitcher({
  households,
  activeId,
}: {
  households: { id: string; name: string }[];
  activeId: string;
}) {
  return (
    <form action={switchHousehold}>
      <label htmlFor="household_id" className="sr-only">
        Household
      </label>
      <select
        id="household_id"
        name="household_id"
        defaultValue={activeId}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-12 rounded-lg border border-input bg-background px-3 text-base"
      >
        {households.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </select>
    </form>
  );
}
