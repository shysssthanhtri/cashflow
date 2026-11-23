import { getTranslations } from "next-intl/server";

import { Separator } from "@/components/ui/separator";

import { CreateHouseholdForm } from "./_components/create-household-form";
import { JoinHouseholdForm } from "./_components/join-household-form";

export default async function AddHouseholdPage() {
  const t = await getTranslations("households");
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">{t("create")}</h1>
      <CreateHouseholdForm />
      <Separator />
      <h2 className="text-lg font-medium">{t("joinWithCode")}</h2>
      <JoinHouseholdForm />
    </main>
  );
}
