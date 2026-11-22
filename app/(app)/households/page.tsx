import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { listHouseholds } from "@/server/libs/households";

const activateUrl = (id: string) =>
  `${ROUTES.householdsActivate}?id=${encodeURIComponent(id)}`;

export default async function HouseholdsPage() {
  const households = await listHouseholds();

  if (households.length === 0) redirect(ROUTES.householdsAdd);
  if (households.length === 1) redirect(activateUrl(households[0].id));

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-6">
      <h1 className="text-lg font-medium">Choose a household</h1>
      <ul className="flex flex-col gap-2">
        {households.map((h) => (
          <li key={h.id}>
            <Link
              href={activateUrl(h.id)}
              prefetch={false}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
            >
              <span>{h.name}</span>
              <span className="text-sm text-muted-foreground">
                {h.currency}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={ROUTES.householdsAdd} className="text-sm underline">
        Create a new household
      </Link>
    </main>
  );
}
