"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { CategoryIcon } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import {
  Field,
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
import { cn } from "@/lib/utils";

import {
  CATEGORY_COLORS,
  CATEGORY_ICON_NAMES,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
} from "../_lib/category-style";
import {
  categorySchema,
  type CategoryValues,
  NO_PARENT,
} from "../_schemas/category";

const TYPE_ITEMS = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
];

export type ParentOption = { id: string; name: string; type: string };

export function CategoryForm({
  parents,
  defaultValues,
  submitLabel,
  action,
}: {
  parents: ParentOption[];
  defaultValues?: CategoryValues;
  submitLabel: string;
  action: (values: CategoryValues) => Promise<{ error: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? {
      name: "",
      type: "expense",
      parentId: NO_PARENT,
      icon: DEFAULT_CATEGORY_ICON,
      color: DEFAULT_CATEGORY_COLOR,
    },
  });
  const icon = useWatch({ control: form.control, name: "icon" });
  const color = useWatch({ control: form.control, name: "color" });
  const type = useWatch({ control: form.control, name: "type" });
  const parentItems = [
    { label: "None (top level)", value: NO_PARENT },
    ...parents
      .filter((p) => p.type === type)
      .map((p) => ({ label: p.name, value: p.id })),
  ];

  function onSubmit(values: CategoryValues) {
    startTransition(async () => {
      const result = await action(values);
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
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                {...field}
                id="category-name"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="category-type">Type</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("parentId", NO_PARENT);
                }}
                items={TYPE_ITEMS}
              >
                <SelectTrigger id="category-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TYPE_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Controller
          name="parentId"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="category-parent">Parent category</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={parentItems}
              >
                <SelectTrigger id="category-parent" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {parentItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Field>
          <FieldLabel>Icon</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ICON_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={icon === name}
                onClick={() => form.setValue("icon", name)}
                className={cn(
                  "rounded-full ring-offset-2 ring-offset-background",
                  icon === name && "ring-2 ring-ring"
                )}
              >
                <CategoryIcon icon={name} color={color} />
              </button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Color</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={color === c}
                onClick={() => form.setValue("color", c)}
                className={cn(
                  "size-8 rounded-full ring-offset-2 ring-offset-background",
                  color === c && "ring-2 ring-ring"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </Field>
        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
