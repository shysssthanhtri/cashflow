import * as z from "zod";

export const MAX_BACKDATE_DAYS = 31;

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const periodSchema = z.object({
  startDate: z.iso.date("Start date is required."),
});

export type PeriodValues = z.infer<typeof periodSchema>;

// Returns an error message when `startDate` is outside the allowed window.
export function validateStartDate(startDate: string, today: string) {
  if (startDate > today) return "Start date can't be in the future.";
  if (startDate < addDays(today, -MAX_BACKDATE_DAYS))
    return `Start date can't be more than ${MAX_BACKDATE_DAYS} days ago.`;
  return null;
}
