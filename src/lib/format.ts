export const inr = (n: number) =>
  "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const inrDecimal = (n: number) =>
  "₹" + (n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const FORMAT_CODES: Record<string, string> = {
  Hoarding: "HRD",
  Unipole: "UNP",
  "Bus Shelter": "BSS",
  "Metro Panel": "MTP",
  "Mall Display": "MLD",
  Transit: "TRN",
  Digital: "DIG",
};

export const cityCode = (city: string) =>
  city
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");

export function generateSiteCode(city: string, format: string, existing: string[]): string {
  const prefix = `${cityCode(city)}-${FORMAT_CODES[format] ?? "GEN"}`;
  const nums = existing
    .filter((c) => c.startsWith(prefix))
    .map((c) => parseInt(c.split("-")[2] || "0", 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86400000);
