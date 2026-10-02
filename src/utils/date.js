const pad = (n) => String(n).padStart(2, '0');
// Local date -> "YYYY-MM-DD" (avoids toISOString() timezone shifts)
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const today = () => toISO(new Date());
export const prettyDate = (iso) =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
