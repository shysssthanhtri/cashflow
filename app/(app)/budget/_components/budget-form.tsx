"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { parseAmount } from "../../transactions/add/_lib/parse-amount";
import { budgetSchema, type BudgetValues } from "../_schemas/budget";

export type CategoryOption = { value: string; label: string };

export function BudgetForm({
  options,
  currency,
  defaultValues,
  categoryLocked = false,
  submitLabel,
  action,
  onDelete,
}: {
  options: CategoryOption[];
  currency: string;
  defaultValues?: BudgetValues;
  categoryLocked?: boolean;
  submitLabel: string;
  action: (values: BudgetValues) => Promise<{ error: string }>;
  onDelete?: () => Promise<{ error: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: defaultValues ?? {
      categoryId: options[0]?.value ?? "",
      amount: "",
      recurring: true,
    },
  });

  const amountText = useWatch({ control: form.control, name: "amount" });
  const parsedAmount = parseAmount(amountText);
  const formatted =
    parsedAmount === null
      ? null
      : new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(parsedAmount);

  function run(fn: () => Promise<{ error: string }>) {
    startTransition(async () => {
      const result = await fn();
      form.setError("root", { message: result.error });
    });
  }

  return (
    <form onSubmit={form.handleSubmit((values) => run(() => action(values)))}>
      <FieldGroup>
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="budget-category">Category</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={options}
                disabled={categoryLocked}
              >
                <SelectTrigger id="budget-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {options.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="budget-amount">
                Amount ({currency})
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="budget-amount"
                  inputMode="decimal"
                  placeholder="e.g. 50000, 50k, 5m"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  className="pr-14"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  {currency}
                </span>
              </div>
              {formatted && (
                <p className="text-sm text-muted-foreground">{formatted}</p>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="recurring"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel htmlFor="budget-recurring">Recurring</FieldLabel>
                <FieldDescription>
                  Carry this budget over to next month automatically.
                </FieldDescription>
              </div>
              <Switch
                id="budget-recurring"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => run(onDelete)}
          >
            Remove budget
          </Button>
        )}
      </FieldGroup>
    </form>
  );
}
