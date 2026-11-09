"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type NameState, saveDisplayName } from "./actions";

export function NameForm() {
  const [state, action, pending] = useActionState<NameState, FormData>(
    saveDisplayName,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="given-name"
          required
          maxLength={60}
          autoFocus
          className="h-12"
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Saving…" : "Continue"}
      </Button>
      <p role="alert" className="text-sm text-destructive">
        {state.message}
      </p>
    </form>
  );
}
