"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { addPeriod } from "../_actions/add-period";
import {
  addDays,
  MAX_BACKDATE_DAYS,
  periodSchema,
  type PeriodValues,
  validateStartDate,
} from "../_schemas/period";

function toDateString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localToday() {
  return toDateString(new Date());
}

export function PeriodForm() {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const form = useForm<PeriodValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: { startDate: localToday() },
  });

  function onSubmit(values: PeriodValues) {
    const error = validateStartDate(values.startDate, localToday());
    if (error) {
      form.setError("startDate", { message: error });
      return;
    }
    startTransition(async () => {
      const result = await addPeriod(values);
      form.setError("root", { message: result.error });
    });
  }

  const today = localToday();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="startDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="period-start-date">Start date</FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="period-start-date"
                      type="button"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className="w-full justify-start font-normal"
                    />
                  }
                >
                  <CalendarIcon />
                  {field.value
                    ? toDate(field.value).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })
                    : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    required
                    selected={field.value ? toDate(field.value) : undefined}
                    defaultMonth={field.value ? toDate(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(toDateString(date));
                      setOpen(false);
                    }}
                    disabled={{
                      before: toDate(addDays(today, -MAX_BACKDATE_DAYS)),
                      after: toDate(today),
                    }}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" disabled={pending}>
          Start period
        </Button>
      </FieldGroup>
    </form>
  );
}
