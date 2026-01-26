import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportData {
  headers: string[];
  data: any[][];
  title: string;
  filename: string;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportToPDF = (exportData: ExportData) => {
  const { headers, data, title, filename } = exportData;
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-HN')}`, 14, 25);
  
  // Add table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (exportData: ExportData) => {
  const { headers, data, title, filename } = exportData;
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  
  // Save the file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const formatCurrencyForExport = (amount: number, currency: string): string => {
  if (currency === 'HNL') {
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  }
  return `$ ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
};

export const formatDateForExport = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-HN');
};