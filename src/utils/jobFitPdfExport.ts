import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Dimension {
  name: string;
  score: number;
  grade: string;
  comment: string;
}

interface EvalResult {
  grade: string;
  score: number;
  summary: string;
  dimensions: Dimension[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  interviewTips: string[];
}

const gradeColorMap: Record<string, [number, number, number]> = {
  A: [16, 185, 129],
  B: [59, 130, 246],
  C: [234, 179, 8],
  D: [249, 115, 22],
  E: [248, 113, 113],
  F: [220, 38, 38],
};

export const exportJobFitToPDF = (result: EvalResult) => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = 20; }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Job Fit Evaluation Report", pw / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(format(new Date(), "yyyy-MM-dd HH:mm"), pw / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 12;

  // Grade box
  const color = gradeColorMap[result.grade] || gradeColorMap.C;
  doc.setFillColor(...color);
  doc.roundedRect(pw / 2 - 20, y, 40, 24, 4, 4, "F");
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(result.grade, pw / 2, y + 17, { align: "center" });
  doc.setTextColor(0);
  y += 30;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${result.score} / 100`, pw / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(result.summary, pw - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 10;

  // Dimensions table
  checkPage(40);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Dimension Scores", 14, y);
  y += 6;

  const dimRows = result.dimensions.map((d) => [d.name, `${d.score}`, d.grade, d.comment]);
  doc.autoTable({
    startY: y,
    head: [["Dimension", "Score", "Grade", "Comment"]],
    body: dimRows,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 15 }, 2: { cellWidth: 15 } },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Helper for bullet sections
  const addBulletSection = (title: string, items: string[], icon?: string) => {
    checkPage(20);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    items.forEach((item, i) => {
      checkPage(10);
      const prefix = icon || `${i + 1}.`;
      const lines = doc.splitTextToSize(`${prefix} ${item}`, pw - 32);
      doc.text(lines, 18, y);
      y += lines.length * 4.5 + 2;
    });
    y += 6;
  };

  addBulletSection("Strengths", result.strengths, "✓");
  addBulletSection("Gaps", result.gaps, "△");
  addBulletSection("Recommendations", result.recommendations);

  if (result.interviewTips?.length > 0) {
    addBulletSection("Interview Tips", result.interviewTips, "★");
  }

  const fileName = `job_fit_${result.grade}_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
  doc.save(fileName);
};
