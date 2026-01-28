import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// Extend jsPDF type for autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface StrategyData {
  type: string;
  data: any;
}

export const exportStrategyToPDF = (strategy: StrategyData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  
  let title = "";
  let subtitle = "";
  
  if (strategy.type === "branding") {
    title = "Personal Branding Strategy";
    subtitle = strategy.data.job_title;
  } else if (strategy.type === "content") {
    title = "Content Strategy";
    subtitle = strategy.data.target_audience;
  } else if (strategy.type === "networking") {
    title = "Networking Strategy";
    subtitle = strategy.data.current_job;
  }
  
  doc.text(title, pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, pageWidth / 2, 30, { align: "center" });
  
  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Created: ${format(new Date(strategy.data.created_at), "yyyy-MM-dd HH:mm", { locale: ko })}`,
    pageWidth / 2,
    38,
    { align: "center" }
  );
  
  doc.setTextColor(0);
  let yPosition = 50;
  
  const addSection = (sectionTitle: string, content: string | string[]) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(sectionTitle, 14, yPosition);
    yPosition += 7;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    if (Array.isArray(content)) {
      content.forEach((item) => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 28);
        doc.text(lines, 18, yPosition);
        yPosition += lines.length * 5 + 2;
      });
    } else {
      const lines = doc.splitTextToSize(content, pageWidth - 28);
      doc.text(lines, 14, yPosition);
      yPosition += lines.length * 5;
    }
    
    yPosition += 8;
  };
  
  const addTable = (headers: string[], rows: string[][]) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.autoTable({
      startY: yPosition,
      head: [headers],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  };
  
  // Export based on strategy type
  if (strategy.type === "branding") {
    const s = strategy.data.strategy;
    
    if (s.brandStatement) {
      addSection("Brand Statement", "");
      if (s.brandStatement.headline) {
        addSection("Headline", s.brandStatement.headline);
      }
      if (s.brandStatement.elevator_pitch) {
        addSection("Elevator Pitch", s.brandStatement.elevator_pitch);
      }
      if (s.brandStatement.tagline) {
        addSection("Tagline", s.brandStatement.tagline);
      }
    }
    
    if (s.uniqueValueProposition?.main) {
      addSection("Unique Value Proposition", s.uniqueValueProposition.main);
    }
    
    if (s.brandPersonality?.traits?.length > 0) {
      addSection("Brand Personality Traits", s.brandPersonality.traits);
    }
    
    if (s.onlinePresence) {
      if (s.onlinePresence.linkedin_headline) {
        addSection("LinkedIn Headline", s.onlinePresence.linkedin_headline);
      }
      if (s.onlinePresence.bio_short) {
        addSection("Short Bio", s.onlinePresence.bio_short);
      }
    }
  } else if (strategy.type === "content") {
    const s = strategy.data.strategy;
    
    if (s.contentStrategy) {
      if (s.contentStrategy.positioning) {
        addSection("Positioning", s.contentStrategy.positioning);
      }
      if (s.contentStrategy.uniqueAngle) {
        addSection("Unique Angle", s.contentStrategy.uniqueAngle);
      }
    }
    
    if (s.contentPillars?.length > 0) {
      addSection("Content Pillars", "");
      const rows = s.contentPillars.map((pillar: any) => [
        pillar.pillar || "",
        `${pillar.percentage || 0}%`,
        pillar.description || "",
      ]);
      addTable(["Pillar", "Percentage", "Description"], rows);
    }
    
    if (s.hashtagStrategy?.primary?.length > 0) {
      addSection("Primary Hashtags", s.hashtagStrategy.primary.map((tag: string) => `#${tag}`));
    }
  } else if (strategy.type === "networking") {
    const s = strategy.data.strategy;
    
    if (s.networkingProfile) {
      if (s.networkingProfile.networkingStyle) {
        addSection("Networking Style", s.networkingProfile.networkingStyle);
      }
      if (s.networkingProfile.uniqueValue) {
        addSection("Unique Value", s.networkingProfile.uniqueValue);
      }
      if (s.networkingProfile.currentStrengths?.length > 0) {
        addSection("Current Strengths", s.networkingProfile.currentStrengths);
      }
    }
    
    if (s.targetAudience?.length > 0) {
      addSection("Target Audience", "");
      const rows = s.targetAudience.map((target: any) => [
        target.type || "",
        target.description || "",
      ]);
      addTable(["Type", "Description"], rows);
    }
    
    if (s.thirtyDayPlan) {
      addSection("30-Day Plan", "");
      const rows = Object.entries(s.thirtyDayPlan).map(([week, data]: [string, any]) => [
        week.toUpperCase(),
        data.focus || "",
      ]);
      addTable(["Week", "Focus"], rows);
    }
  }
  
  // Save
  const fileName = `${strategy.type}_strategy_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
  doc.save(fileName);
};
