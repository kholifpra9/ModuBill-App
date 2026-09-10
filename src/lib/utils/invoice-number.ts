// Format: INV-20250115-A3F9
export function generateInvoiceNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${datePart}-${randomPart}`;
}