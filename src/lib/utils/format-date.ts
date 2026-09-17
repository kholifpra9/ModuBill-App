/**
 * Helper untuk memformat string tanggal dari database/form
 * agar tampilannya konsisten dan tidak tergeser oleh UTC offset browser.
 */
export function formatTransactionDate(
  dateString: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "—";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  // Default format jika opsi tidak diberikan
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC", 
  };

  return new Intl.DateTimeFormat("id-ID", {
    ...defaultOptions,
    ...options,
  }).format(date);
}