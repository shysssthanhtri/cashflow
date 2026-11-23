"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { joinHousehold } from "../_actions/join-household";
import {
  joinHouseholdSchema,
  type JoinHouseholdValues,
} from "../_schemas/join-household";

export function JoinHouseholdForm() {
  const t = useTranslations("households");
  const [pending, startTransition] = useTransition();
  const form = useForm<JoinHouseholdValues>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: { inviteCode: "" },
  });

  function onSubmit(values: JoinHouseholdValues) {
    startTransition(async () => {
      const result = await joinHousehold(values);
      form.setError("root", { message: result.error });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="inviteCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="household-invite-code">
                {t("inviteCode")}
              </FieldLabel>
              <Input
                {...field}
                id="household-invite-code"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" variant="outline" disabled={pending}>
          {t("joinSubmit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
