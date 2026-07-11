import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── CSV / Google Sheets ──────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
}

// ── Excel ────────────────────────────────────────────────────────────────────

function exportExcel(
  sheets: { name: string; headers: string[]; rows: (string | number)[][] }[],
  filename: string,
) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
    // Bold header row
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
      if (cell) cell.s = { font: { bold: true } };
    }
    XLSX.utils.book_append_sheet(wb, ws, s.name);
  }
  XLSX.writeFile(wb, filename);
}

// ── PDF ──────────────────────────────────────────────────────────────────────

function exportPDF(
  title: string,
  sections: { heading: string; headers: string[]; rows: (string | number)[][] }[],
  filename: string,
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`BIZEX4U · Generated ${now} IST`, 14, 22);

  let y = 28;
  for (const sec of sections) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(sec.heading, 14, y);
    y += 2;
    autoTable(doc, {
      startY: y,
      head: [sec.headers],
      body: sec.rows.map((r) => r.map(String)),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [107, 33, 168], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.save(filename);
}

// ── Domain exports ───────────────────────────────────────────────────────────

import type { Site } from "./stores";
import type { Invoice } from "./stores";
import type { BarterDeal, Partner } from "./stores";
import { invoiceOutstanding, invoiceTotal } from "./stores";

export function exportInventory(sites: Site[], format: "pdf" | "excel" | "csv") {
  const headers = ["Code", "Name", "City", "Format", "Status", "Monthly Rent (₹)", "Lat", "Lng", "Notes"];
  const rows = sites.map((s) => [
    s.code, s.name, s.city, s.format, s.status,
    s.monthlyRent, s.lat, s.lng, s.notes ?? "",
  ]);

  if (format === "csv") {
    downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv" }), "atlas-inventory.csv");
  } else if (format === "excel") {
    exportExcel([{ name: "Inventory", headers, rows }], "atlas-inventory.xlsx");
  } else {
    exportPDF("Site Inventory", [{ heading: "All Sites", headers, rows }], "atlas-inventory.pdf");
  }
}

export function exportAccounts(invoices: Invoice[], format: "pdf" | "excel" | "csv") {
  const headers = ["Invoice #", "Type", "Party", "Date", "Due Date", "Total (₹)", "Outstanding (₹)", "Status"];
  const rows = invoices.map((i) => [
    i.number, i.type === "sales" ? "Sales" : "Purchase",
    i.party, i.date, i.dueDate,
    invoiceTotal(i), invoiceOutstanding(i), i.status,
  ]);

  if (format === "csv") {
    downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv" }), "atlas-accounts.csv");
  } else if (format === "excel") {
    const sales = invoices.filter((i) => i.type === "sales");
    const purchases = invoices.filter((i) => i.type === "purchase");
    exportExcel([
      { name: "Receivables", headers, rows: sales.map((i) => [i.number, "Sales", i.party, i.date, i.dueDate, invoiceTotal(i), invoiceOutstanding(i), i.status]) },
      { name: "Payables",    headers, rows: purchases.map((i) => [i.number, "Purchase", i.party, i.date, i.dueDate, invoiceTotal(i), invoiceOutstanding(i), i.status]) },
    ], "atlas-accounts.xlsx");
  } else {
    exportPDF("Accounts", [{ heading: "All Invoices", headers, rows }], "atlas-accounts.pdf");
  }
}

export function exportBarter(deals: BarterDeal[], partners: Partner[], sites: Site[], format: "pdf" | "excel" | "csv") {
  const headers = ["Deal ID", "Partner", "Sites", "Start", "End", "Products Value (₹)", "Status"];
  const rows = deals.map((d) => {
    const partner = partners.find((p) => p.id === d.partnerId);
    const siteNames = d.siteIds.map((sid) => sites.find((s) => s.id === sid)?.code ?? sid).join(", ");
    const productsValue = d.productsReceived.reduce((a, p) => a + p.value, 0);
    return [d.id.slice(0, 8), partner?.company ?? "Unknown", siteNames, d.startDate, d.endDate, productsValue, d.status];
  });

  if (format === "csv") {
    downloadBlob(new Blob([toCSV(headers, rows)], { type: "text/csv" }), "atlas-barter.csv");
  } else if (format === "excel") {
    exportExcel([{ name: "Barter Deals", headers, rows }], "atlas-barter.xlsx");
  } else {
    exportPDF("Barter Deals", [{ heading: "All Deals", headers, rows }], "atlas-barter.pdf");
  }
}
