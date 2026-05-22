// ============================================================
// FORMAT HELPERS
// ============================================================

/** Format a number to 2 decimal places. NO dollar sign — per Elegante style guide. */
export function fmt(n: number): string {
  return n.toFixed(2);
}

/** Format for display inside tables: right-aligned, 2 decimals */
export function fmtNum(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Generate a quote number like EC-YYMMDD-0001 */
export function generateQuoteNumber(): string {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const dd  = String(now.getDate()).padStart(2, "0");
  // Random 4-digit suffix so refreshing doesn't duplicate
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `CGO-${yy}${mm}${dd}-${seq}`;
}

/** Format a JS Date as MM/DD/YYYY */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}
