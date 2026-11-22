"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

import { editHousehold } from "../_actions/edit-household";
import {
  editHouseholdSchema,
  type EditHouseholdValues,
} from "../_schemas/household";

export function EditHouseholdForm({
  id,
  name,
  nickname,
}: {
  id: string;
  name: string;
  nickname: string;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<EditHouseholdValues>({
    resolver: zodResolver(editHouseholdSchema),
    defaultValues: { name, nickname },
  });

  function onSubmit(values: EditHouseholdValues) {
    startTransition(async () => {
      const result = await editHousehold(id, values);
      form.setError("root", { message: result.error });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="household-name">Household name</FieldLabel>
              <Input
                {...field}
                id="household-name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="nickname"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="household-nickname">Nickname</FieldLabel>
              <Input
                {...field}
                id="household-nickname"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder="Your display name in this household"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" disabled={pending}>
          Save changes
        </Button>
      </FieldGroup>
    </form>
  );
}
