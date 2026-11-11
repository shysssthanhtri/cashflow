"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createHousehold, type FormState } from "../actions";

export function CreateHouseholdForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createHousehold,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Household name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={60}
          autoFocus
          placeholder="e.g. Nguyen family"
          className="h-12"
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Creating…" : "Create household"}
      </Button>
      <p role="alert" className="text-sm text-destructive">
        {state.message}
      </p>
    </form>
  );
}
