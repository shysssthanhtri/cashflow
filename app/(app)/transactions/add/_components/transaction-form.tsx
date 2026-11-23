"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { enUS, vi } from "react-day-picker/locale";
import { Controller, useForm, useWatch } from "react-hook-form";

import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { matchCategory } from "../_lib/match-category";
import { extractAmount, parseAmount } from "../_lib/parse-amount";
import { useOutbox } from "../_lib/use-outbox";
import {
  NO_CATEGORY,
  transactionSchema,
  type TransactionValues,
  validateOccurredAt,
} from "../_schemas/transaction";
import { SyncStatus } from "./sync-status";

type TxType = TransactionValues["type"];

export type CategoryOption = {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
};

function toDateString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toAmountText(token: string | null) {
  const n = token ? parseAmount(token) : null;
  return n === null ? "" : String(n);
}

export function TransactionForm({
  categories,
  topCategoryIds,
  currency,
}: {
  categories: CategoryOption[];
  topCategoryIds: string[];
  currency: string;
}) {
  const t = useTranslations("transactions");
  const tr = useTranslations("report");
  const tc = useTranslations("common");
  const tcat = useTranslations("categories");
  const locale = useLocale();
  const TYPE_ITEMS = (["expense", "income", "saving"] as const).map((v) => ({
    label: tcat(`types.${v}`),
    value: v,
  }));
  const outbox = useOutbox();
  const [dateOpen, setDateOpen] = useState(false);
  const [amountEdited, setAmountEdited] = useState(false);
  const [categoryEdited, setCategoryEdited] = useState(false);
  const defaultValues: TransactionValues = {
    note: "",
    amount: "",
    type: "expense",
    categoryId: NO_CATEGORY,
    occurredAt: toDateString(new Date()),
  };
  const form = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });
  const amountText = useWatch({ control: form.control, name: "amount" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });
  const parsedAmount = parseAmount(amountText);
  const formatted =
    parsedAmount === null
      ? null
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(parsedAmount);
  const categoryItems = [
    { label: t("noCategory"), value: NO_CATEGORY },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];
  const topCategories = topCategoryIds
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is CategoryOption => !!c);
  const otherCategories = categories.filter(
    (c) => !topCategories.some((t) => t.id === c.id)
  );

  function onSubmit(values: TransactionValues) {
    const error = validateOccurredAt(
      values.occurredAt,
      toDateString(new Date())
    );
    if (error) {
      form.setError("occurredAt", { message: error });
      return;
    }
    outbox.enqueue(values);
    setAmountEdited(false);
    setCategoryEdited(false);
    form.reset({ ...defaultValues, type: values.type });
    form.setFocus("note");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="note"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tx-note">{t("note")}</FieldLabel>
              <Input
                {...field}
                id="tx-note"
                placeholder={t("notePlaceholder")}
                autoComplete="off"
                autoFocus
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  field.onChange(e);
                  if (!amountEdited) {
                    form.setValue(
                      "amount",
                      toAmountText(extractAmount(e.target.value)),
                      { shouldValidate: form.formState.isSubmitted }
                    );
                  }
                  if (!categoryEdited) {
                    const match = matchCategory(e.target.value, categories);
                    form.setValue("categoryId", match?.id ?? NO_CATEGORY);
                    if (match) form.setValue("type", match.type as TxType);
                  }
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tx-amount">
                {tc("amountWithCurrency", { currency })}
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="tx-amount"
                  inputMode="decimal"
                  placeholder="14.000"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    setAmountEdited(e.target.value !== "");
                    field.onChange(e);
                  }}
                  onBlur={() => {
                    field.onBlur();
                    const text = toAmountText(field.value);
                    if (text) form.setValue("amount", text);
                  }}
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
          name="categoryId"
          control={form.control}
          render={({ field }) => {
            const selectCategory = (value: string) => {
              setCategoryEdited(true);
              field.onChange(value);
              const picked = categories.find((c) => c.id === value);
              if (picked) form.setValue("type", picked.type as TxType);
            };
            const extra = otherCategories.find((c) => c.id === field.value);
            const badgeCategories = extra
              ? [...topCategories, extra]
              : topCategories;
            return (
              <Field>
                <FieldLabel>{t("categoryOptional")}</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {badgeCategories.map((c) => {
                    const selected = field.value === c.id;
                    return (
                      <CategoryBadge
                        key={c.id}
                        icon={c.icon}
                        color={c.color}
                        selected={selected}
                        className="cursor-pointer"
                        render={
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              selectCategory(selected ? NO_CATEGORY : c.id)
                            }
                          />
                        }
                      >
                        {c.name}
                      </CategoryBadge>
                    );
                  })}
                </div>
                {otherCategories.length > 0 && (
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => selectCategory(value as string)}
                    items={categoryItems}
                  >
                    <SelectTrigger id="tx-category" className="w-full">
                      <SelectValue placeholder={t("moreCategories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={NO_CATEGORY}>
                          {t("noCategory")}
                        </SelectItem>
                      </SelectGroup>
                      {TYPE_ITEMS.map((group) => (
                        <SelectGroup key={group.value}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {otherCategories
                            .filter((c) => c.type === group.value)
                            .map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
            );
          }}
        />
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="w-fit">
              <Switch
                id="tx-type"
                name={field.name}
                checked={field.value === "income"}
                disabled={categoryId !== NO_CATEGORY}
                onCheckedChange={(checked) => {
                  const value: TxType = checked ? "income" : "expense";
                  field.onChange(value);
                  const current = categories.find(
                    (c) => c.id === form.getValues("categoryId")
                  );
                  if (current && current.type !== value)
                    form.setValue("categoryId", NO_CATEGORY);
                }}
              />
              <FieldLabel
                htmlFor="tx-type"
                className={
                  categoryId === NO_CATEGORY ? "cursor-pointer" : undefined
                }
              >
                {field.value === "income" ? tr("income") : tr("expense")}
              </FieldLabel>
            </Field>
          )}
        />
        <Controller
          name="occurredAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tx-date">{t("date")}</FieldLabel>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      id="tx-date"
                      type="button"
                      variant="outline"
                      aria-invalid={fieldState.invalid}
                      className="w-full justify-start font-normal"
                    />
                  }
                >
                  <CalendarIcon />
                  {field.value
                    ? toDate(field.value).toLocaleDateString(locale, {
                        dateStyle: "medium",
                      })
                    : t("pickDate")}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    locale={locale === "vi" ? vi : enUS}
                    required
                    selected={field.value ? toDate(field.value) : undefined}
                    defaultMonth={field.value ? toDate(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(toDateString(date));
                      setDateOpen(false);
                    }}
                    disabled={{
                      after: new Date(),
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
        <Button type="submit">{t("addSubmit")}</Button>
        <SyncStatus
          pendingCount={outbox.pendingCount}
          syncing={outbox.syncing}
          failed={outbox.failed}
          currency={currency}
          onRestore={(item) => {
            form.reset(item.values);
            setAmountEdited(true);
            setCategoryEdited(true);
            outbox.discard(item.clientId);
          }}
          onDiscard={outbox.discard}
        />
      </FieldGroup>
    </form>
  );
}
