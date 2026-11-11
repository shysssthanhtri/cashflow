"use client";

import { useActionState } from "react";

import { type FormState, inviteMember } from "@/app/households/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({ householdId }: { householdId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    inviteMember,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="household_id" value={householdId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Invite by email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          required
          className="h-12"
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Inviting…" : "Invite"}
      </Button>
      <p
        role={state.ok ? "status" : "alert"}
        className={state.ok ? "text-sm" : "text-sm text-destructive"}
      >
        {state.message}
      </p>
    </form>
  );
}
