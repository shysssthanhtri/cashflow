const MONTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function parseMonth(value: string | undefined) {
  return value && MONTH_RE.test(value) ? value : currentMonth();
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function monthRange(month: string) {
  return { from: `${month}-01`, to: `${shiftMonth(month, 1)}-01` };
}
