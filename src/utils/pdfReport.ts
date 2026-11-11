import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Grievance } from '../types';

export interface ReportFilterOptions {
  statusFilter: string;
  districtFilter: string;
  priorityFilter: string;
  overdueOnly: boolean;
  search?: string;
  generatedBy?: string;
}

export function formatGrievanceReportData(grievances: Grievance[]) {
  return grievances.map((g, index) => {
    const isOverdue = g.is_overdue || (g.status !== 'Resolved' && new Date() > new Date(g.due_date));
    const dept = g.department_name || g.ai_suggested_department_name || 'Unassigned';
    const dueDateFormatted = new Date(g.due_date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return [
      (index + 1).toString(),
      g.reference_no,
      `${g.citizen_name || 'Citizen'}\n(${g.district})`,
      `${g.subject.length > 50 ? g.subject.substring(0, 48) + '...' : g.subject}\n[${g.category}]`,
      dept.split('(')[0].trim(),
      `${g.priority}${g.priority === 'High' ? ' (!)' : ''}`,
      g.status,
      `${dueDateFormatted}${isOverdue ? '\n[OVERDUE]' : ''}`
    ];
  });
}

export function generateGrievancePDF(
  grievances: Grievance[],
  options: ReportFilterOptions
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Header Banner & Government Styling
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF KERALA (SIMULATED) — CHIEF MINISTER\'S OFFICE', 14, 8);

  doc.setFontSize(13);
  doc.text('PUBLIC GRIEVANCE REDRESSAL CELL — EXECUTIVE SUMMARY REPORT', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(209, 250, 229);
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.text(`Generated: ${dateStr} | Auth: ${options.generatedBy || 'CMO Administrator'}`, 14, 20);

  // 2. Sub-Header: Filter Criteria & Active Metrics
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 24, pageWidth, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, 38, pageWidth, 38);

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const filterSummary = [
    `Status: ${options.statusFilter.toUpperCase()}`,
    `District: ${options.districtFilter.toUpperCase()}`,
    `Priority: ${options.priorityFilter.toUpperCase()}`,
    `Overdue Filter: ${options.overdueOnly ? 'YES (OVERDUE ONLY)' : 'ALL'}`,
    options.search ? `Search: "${options.search}"` : ''
  ].filter(Boolean).join('  |  ');

  doc.text(`ACTIVE FILTER: ${filterSummary}`, 14, 30);

  // KPI Quick Counts
  const total = grievances.length;
  const highPriority = grievances.filter(g => g.priority === 'High').length;
  const overdueCount = grievances.filter(g => g.is_overdue || (g.status !== 'Resolved' && new Date() > new Date(g.due_date))).length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Listed: ${total}   •   High Priority: ${highPriority}   •   SLA Overdue: ${overdueCount}   •   Resolved: ${resolvedCount}`,
    14,
    35
  );

  // 3. Tabular Data using jspdf-autotable
  const tableData = formatGrievanceReportData(grievances);

  autoTable(doc, {
    startY: 42,
    head: [
      ['#', 'Reference No', 'Citizen (District)', 'Subject & Category', 'Department', 'Priority', 'Status', 'SLA Due']
    ],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 85 },
      4: { cellWidth: 45 },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 26, halign: 'center' },
      7: { cellWidth: 22, halign: 'center' }
    },
    didDrawPage: (data) => {
      // Footer on every page
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Recruitment prototype for WhiteMatrix assessment. Not affiliated with or endorsed by the Government of Kerala or the CMO.',
        14,
        pageHeight - 6
      );

      const pageNumberStr = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.text(pageNumberStr, pageWidth - 14 - doc.getTextWidth(pageNumberStr), pageHeight - 6);
    }
  });

  return doc;
}
