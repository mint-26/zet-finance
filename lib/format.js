// Shared formatting helpers. Plain functions with no browser/server APIs,
// safe to import from both client components and server routes.

// Format an ISO date ("YYYY-MM-DD") as German "DD.MM.YYYY".
// Parses the string directly (no Date) to avoid timezone shifts.
// Returns the original value unchanged if it does not match the expected format.
export function formatBirthdate(value) {
  if (typeof value !== 'string') return value;
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return value;
  return `${m[3]}.${m[2]}.${m[1]}`;
}
