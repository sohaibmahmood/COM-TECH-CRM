"use client";

import type React from "react";
import { formatPKR } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { WhatsAppShareDialog } from "@/components/whatsapp-share-dialog";
import Image from "next/image";

// Custom SVG icons (same as before)
const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 21h6"
    />
  </svg>
);

const PrintIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <polyline points="6,9 6,2 18,2 18,9" />
    <path d="M6,18H4a2,2 0 0,1-2-2v-5a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

interface Receipt {
  id: string;
  receipt_number: string;
  payment_date: string;
  payment_method: string;
  total_fee: number;
  paid_amount: number;
  remaining_due: number;
  description: string;
  notes: string;
  created_at: string;
  students: {
    student_name: string;
    roll_number: string;
    class: string;
    course: string;
    parent_phone: string;
    parent_email: string;
    joining_date: string;
  };
}

interface ViewReceiptDialogProps {
  children: React.ReactNode;
  receipt: Receipt;
}

// Canvas Receipt Component
const CanvasReceipt: React.FC<{
  receipt: Receipt;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
}> = ({ receipt, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawReceipt = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 1100;

      // Clear canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw logo
      const logoImg = new window.Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src =
        "https://storage.googleapis.com/msgsndr/Taw805afayyLk4MOL492/media/68bdcfb1067feb5bc442e525.jpeg";

      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Continue even if logo fails to load
      });

      // Draw logo (if loaded)
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, 50, 30, 60, 60);
      }

      // Header with logo space
      ctx.fillStyle = "#0D1929";
      ctx.font = "bold 32px Arial";
      ctx.fillText("Com-Tech Academy", 130, 70); // Moved right to make space for logo

      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.fillText("Official Fee Receipt", 130, 95);

      // Receipt Number - wider box
      ctx.strokeStyle = "#ffb45f";
      ctx.lineWidth = 2;
      ctx.strokeRect(580, 50, 170, 40); // Increased width from 150 to 170
      ctx.fillStyle = "#ffb45f";
      ctx.font = "bold 18px Arial";
      ctx.fillText(`#${receipt.receipt_number}`, 590, 75); // Adjusted position

      // Separator line
      ctx.fillStyle = "#ffb45f";
      ctx.fillRect(50, 140, 700, 3);

      let yPos = 200;

      // Student Information
      ctx.fillStyle = "#0D1929";
      ctx.font = "bold 20px Arial";
      ctx.fillText("Student Information", 50, yPos);
      yPos += 40;

      // Left Column
      const leftCol = 50;
      const rightCol = 420;

      // Student Name
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Student Name", leftCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "bold 18px Arial";
      ctx.fillText(receipt.students.student_name, leftCol, yPos + 25);

      // Course (right column)
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Course", rightCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "16px Arial";
      ctx.fillText(receipt.students.course, rightCol, yPos + 25);

      yPos += 70;

      // Roll No
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Roll No.", leftCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "16px Arial";
      ctx.fillText(receipt.students.roll_number, leftCol, yPos + 25);

      // Parent Phone (right column)
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Parent Phone", rightCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "16px Arial";
      ctx.fillText(receipt.students.parent_phone || "-", rightCol, yPos + 25);

      yPos += 70;

      // Class
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Class", leftCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "16px Arial";
      ctx.fillText(receipt.students.class, leftCol, yPos + 25);

      // Payment Date (right column)
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Payment Date", rightCol, yPos);
      ctx.fillStyle = "#0D1929";
      ctx.font = "16px Arial";
      ctx.fillText(
        new Date(receipt.payment_date).toLocaleDateString(),
        rightCol,
        yPos + 25
      );

      yPos += 80;

      // Separator
      ctx.fillStyle = "#ffb45f";
      ctx.fillRect(50, yPos, 700, 2);
      yPos += 40;

      // Payment Details Box
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(50, yPos, 700, 200);
      ctx.strokeStyle = "#ffb45f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(50, yPos);
      ctx.lineTo(50, yPos + 200);
      ctx.stroke();

      yPos += 30;
      ctx.fillStyle = "#0D1929";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Payment Details", 70, yPos);
      yPos += 40;

      // Payment Grid
      const gridCols = [70, 250, 430, 610];
      const gridLabels = [
        "Description",
        "Total Fee",
        "Paid Now",
        "Remaining Due",
      ];
      const gridValues = [
        receipt.description,
        formatPKR(receipt.total_fee),
        formatPKR(receipt.paid_amount),
        formatPKR(receipt.remaining_due),
      ];

      // Labels
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      gridLabels.forEach((label, i) => {
        ctx.fillText(label, gridCols[i], yPos);
      });

      yPos += 25;

      // Values
      gridValues.forEach((value, i) => {
        ctx.fillStyle = i === 2 ? "#28a745" : i === 3 ? "#dc3545" : "#0D1929";
        ctx.font = "bold 16px Arial";
        ctx.fillText(value, gridCols[i], yPos);
      });

      yPos += 50;

      // Payment Method
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Payment Method:", 70, yPos);

      // Payment Method Badge
      ctx.fillStyle = "#ffb45f";
      ctx.fillRect(200, yPos - 20, 120, 30);
      ctx.fillStyle = "#0D1929";
      ctx.font = "bold 14px Arial";
      ctx.fillText(receipt.payment_method, 210, yPos - 5);

      yPos += 80;

      // Notes (if any)
      if (receipt.notes) {
        ctx.fillStyle = "#fff3e0";
        ctx.fillRect(50, yPos, 700, 80);
        ctx.strokeStyle = "#ffb45f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(50, yPos);
        ctx.lineTo(50, yPos + 80);
        ctx.stroke();

        yPos += 25;
        ctx.fillStyle = "#666";
        ctx.font = "14px Arial";
        ctx.fillText("Notes", 70, yPos);

        yPos += 25;
        ctx.fillStyle = "#0D1929";
        ctx.font = "16px Arial";
        ctx.fillText(receipt.notes, 70, yPos);

        yPos += 60;
      }

      // Footer
      ctx.fillStyle = "#e9ecef";
      ctx.fillRect(50, yPos, 700, 2);
      yPos += 40;

      // Generated on
      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.fillText(
        `Receipt generated on ${new Date(
          receipt.created_at
        ).toLocaleDateString()}`,
        50,
        yPos
      );
      ctx.fillText("COMTECH Academy", 50, yPos + 15);

      // Signature
      ctx.fillStyle = "#666";
      ctx.font = "14px Arial";
      ctx.fillText("Authorized Signature", 580, yPos);

      ctx.fillStyle = "#0D1929";
      ctx.font = "italic bold 20px 'Brush Script MT', cursive"; // Script style font
      ctx.fillText("Sir Luqman", 610, yPos + 25); // Changed to "Sir Luqman"

      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.fillText("MS Computer", 615, yPos + 40);

      // Signature line
      ctx.strokeStyle = "#0D1929";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(580, yPos + 50);
      ctx.lineTo(730, yPos + 50);
      ctx.stroke();

      // Beautiful Stamp - moved down to avoid hiding remaining due
      const stampX = 650;
      const stampY = yPos - 80; // Moved down from -120 to -80
      const stampRadius = 60;

      // Outer circles
      ctx.strokeStyle = "#dc3545";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(stampX, stampY, stampRadius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(stampX, stampY, stampRadius - 8, 0, 2 * Math.PI);
      ctx.stroke();

      // Background
      ctx.fillStyle = "rgba(220, 53, 69, 0.1)";
      ctx.beginPath();
      ctx.arc(stampX, stampY, stampRadius - 8, 0, 2 * Math.PI);
      ctx.fill();

      // Top text "COM-TECH ACADEMY"
      ctx.fillStyle = "#dc3545";
      ctx.font = "bold 10px Arial";
      ctx.save();
      ctx.translate(stampX, stampY);
      ctx.rotate(-Math.PI / 2);

      const topText = "COM-TECH ACADEMY";
      for (let i = 0; i < topText.length; i++) {
        const angle = (i / (topText.length - 1)) * Math.PI - Math.PI / 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillText(topText[i], 0, -40);
        ctx.restore();
      }
      ctx.restore();

      // Bottom text "FINANCE DEPARTMENT"
      ctx.save();
      ctx.translate(stampX, stampY);
      ctx.rotate(Math.PI / 2);

      const bottomText = "FINANCE DEPARTMENT";
      for (let i = 0; i < bottomText.length; i++) {
        const angle = (i / (bottomText.length - 1)) * Math.PI - Math.PI / 2;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillText(bottomText[i], 0, -40);
        ctx.restore();
      }
      ctx.restore();

      // Center "PAID"
      ctx.fillStyle = "#dc3545";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAID", stampX, stampY - 5);

      // Date in stamp
      ctx.font = "10px Arial";
      ctx.fillText("DATE:", stampX, stampY + 15);
      ctx.fillText(new Date().toLocaleDateString(), stampX, stampY + 28);

      // Stars
      const drawStar = (x: number, y: number, size: number) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const nextAngle = ((i + 1) * Math.PI * 2) / 5;
          if (i === 0) {
            ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
          }
          ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
          ctx.lineTo(
            x + Math.cos(nextAngle) * size * 0.5,
            y + Math.sin(nextAngle) * size * 0.5
          );
        }
        ctx.closePath();
        ctx.fill();
      };

      // Three stars at top
      drawStar(stampX - 15, stampY - 25, 3);
      drawStar(stampX, stampY - 30, 3);
      drawStar(stampX + 15, stampY - 25, 3);

      // Two stars on sides
      drawStar(stampX - 35, stampY, 4);
      drawStar(stampX + 35, stampY, 4);

      // Reset text align
      ctx.textAlign = "left";

      onCanvasReady(canvas);
    };

    // Small delay to ensure canvas is ready
    setTimeout(drawReceipt, 100);
  }, [receipt, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="border rounded-lg shadow-lg max-w-full h-auto"
      style={{ maxHeight: "70vh" }}
    />
  );
};

export function ViewReceiptDialog({
  children,
  receipt,
}: ViewReceiptDialogProps) {
  const [open, setOpen] = useState(false);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null
  );
  const { toast } = useToast();

  const handlePrint = () => {
    if (!canvasElement) {
      toast({
        title: "Error",
        description: "Receipt not ready for printing. Please wait.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const imgData = canvasElement.toDataURL("image/png");

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.receipt_number}</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Receipt" />
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = async () => {
    try {
      if (!canvasElement) {
        toast({
          title: "Error",
          description: "Receipt not ready. Please wait.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Generating PDF",
        description: "Please wait...",
      });

      const { default: jsPDF } = await import("jspdf");

      // Create PDF from canvas
      const imgData = canvasElement.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvasElement.height * imgWidth) / canvasElement.width;

      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      pdf.save(`Receipt-${receipt.receipt_number}.pdf`);

      toast({
        title: "Download Complete",
        description: "Receipt PDF downloaded successfully!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateReceiptPDF = async () => {
    try {
      if (!canvasElement) {
        console.error("Canvas element not ready");
        return null;
      }

      toast({
        title: "Generating Receipt",
        description: "Please wait while we prepare your receipt...",
      });

      // Convert canvas to data URL (base64 string)
      const dataURL = canvasElement.toDataURL("image/png");

      // Create a download link and trigger download
      const link = document.createElement("a");
      link.download = `Receipt-${receipt.receipt_number}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return dataURL;
    } catch (error) {
      console.error("Error generating receipt image:", error);

      toast({
        title: "Image Generation Failed",
        description: "Using text format instead. Please try again for image.",
        variant: "destructive",
      });

      // Fallback to text version
      const receiptText = `
🏫 *COM-TECH ACADEMY*
📄 *Official Fee Receipt*

📋 *Receipt Details:*
Receipt No: ${receipt.receipt_number}
Date: ${new Date(receipt.payment_date).toLocaleDateString()}

👨‍🎓 *Student Information:*
Name: ${receipt.students.student_name}
Roll No: ${receipt.students.roll_number}
Class: ${receipt.students.class}
Course: ${receipt.students.course}

💰 *Payment Details:*
Description: ${receipt.description}
Total Fee: ${formatPKR(receipt.total_fee)}
Paid Amount: ${formatPKR(receipt.paid_amount)}
Remaining Due: ${formatPKR(receipt.remaining_due)}
Payment Method: ${receipt.payment_method}

${receipt.notes ? `📝 Notes: ${receipt.notes}` : ""}

✅ *Status:* ${receipt.remaining_due > 0 ? "Partial Payment" : "Fully Paid"}

---
Com-Tech Academy - COMTECH
Generated on: ${new Date().toLocaleDateString()}
      `.trim();

      return receiptText;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50">
        <DialogHeader className="bg-white p-4 rounded-t-lg border-b border-gray-200">
          <DialogTitle className="flex items-center justify-between text-slate-800">
            <span className="text-xl font-bold">
              Fee Receipt - {receipt.receipt_number}
            </span>
            <div className="flex gap-2">
              <WhatsAppShareDialog
                receipt={receipt}
                generatePDF={generateReceiptPDF}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-animate bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 transition-all duration-200"
                >
                  <WhatsAppIcon />
                  Share Image
                </Button>
              </WhatsAppShareDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="btn-animate bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                <PrintIcon />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="btn-animate bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-300 transition-all duration-200"
              >
                <DownloadIcon />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Canvas Receipt */}
        <div className="flex justify-center p-6 bg-white m-4 rounded-lg shadow-sm border">
          <CanvasReceipt receipt={receipt} onCanvasReady={setCanvasElement} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
