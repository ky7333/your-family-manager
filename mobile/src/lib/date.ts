const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number): string => value.toString().padStart(2, '0');

export function formatDateToApiValue(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

export function parseApiDateValue(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateToApiValue(parsed) === value ? parsed : null;
}
