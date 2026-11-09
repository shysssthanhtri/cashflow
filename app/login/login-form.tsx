"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type LoginState, sendMagicLink } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          className="h-12"
        />
      </div>
      <Button type="submit" disabled={pending} className="min-h-12">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <p role="status" aria-live="polite" className="text-sm">
        {state.message && (
          <span className={state.status === "error" ? "text-destructive" : ""}>
            {state.message}
          </span>
        )}
      </p>
    </form>
  );
}
