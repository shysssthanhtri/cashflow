import Link from "next/link";

import { ROUTES } from "@/config/routes";
import { listHouseholds } from "@/server/libs/households";

import { HouseholdOption } from "./_components/household-option";

const activateUrl = (id: string) =>
  `${ROUTES.householdsActivate}?id=${encodeURIComponent(id)}`;

export default async function HouseholdsPage() {
  const households = await listHouseholds();

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">Choose a household</h1>
      <ul className="flex flex-col gap-2">
        {households.map((h) => (
          <li key={h.id}>
            <HouseholdOption
              href={activateUrl(h.id)}
              name={h.name}
              currency={h.currency}
            />
          </li>
        ))}
      </ul>
      <Link href={ROUTES.householdsAdd} className="text-sm underline">
        Create a new household
      </Link>
    </main>
  );
}
