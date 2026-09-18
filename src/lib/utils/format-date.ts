/**
 * Helper untuk memformat string tanggal dari database/form
 * agar tampilannya konsisten dan tidak tergeser oleh UTC offset browser.
 *
 * PENTING: default timeZone "UTC" di sini SENGAJA, nge-pair sama
 * getNowISO() di transaction-form.tsx yang menyimpan angka waktu LOKAL
 * browser (bukan UTC asli) berlabel UTC. Sudah divalidasi manual:
 * tanpa "UTC" di sini, input jam 08:00 WIB tampil jadi ~01:00 di History
 * (WIB = UTC+7, kegeser 7 jam). JANGAN ubah salah satu tanpa ubah
 * satunya lagi.
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