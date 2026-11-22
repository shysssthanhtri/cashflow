import { Separator } from "@/components/ui/separator";

import { CreateHouseholdForm } from "./_components/create-household-form";
import { JoinHouseholdForm } from "./_components/join-household-form";

export default function AddHouseholdPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-6">
      <h1 className="text-lg font-medium">Create a household</h1>
      <CreateHouseholdForm />
      <Separator />
      <h2 className="text-lg font-medium">Join with an invite code</h2>
      <JoinHouseholdForm />
    </main>
  );
}
