"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatPKR } from "@/lib/utils";

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
  students: {
    student_name: string;
    roll_number: string;
    class: string;
    course: string;
    parent_phone: string;
  };
}

interface WhatsAppShareDialogProps {
  children: React.ReactNode;
  receipt: Receipt;
  generatePDF?: () => Promise<string | null>;
}

export function WhatsAppShareDialog({
  children,
  receipt,
  generatePDF,
}: WhatsAppShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    receipt.students.parent_phone || ""
  );
  const [customMessage, setCustomMessage] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const generateReceiptMessage = async () => {
    const baseMessage = `🎓 *COM-TECH ACADEMY - Fee Receipt*

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
${
  receipt.remaining_due > 0
    ? `Remaining Due: ${formatPKR(receipt.remaining_due)}`
    : "✅ Fully Paid"
}
Payment Method: ${receipt.payment_method}

${receipt.notes ? `📝 *Notes:* ${receipt.notes}` : ""}

${
  receipt.remaining_due > 0
    ? "⚠️ *Status:* Partial Payment"
    : "✅ *Status:* Fully Paid"
}

Thank you for your payment! 🙏

---
*COM-TECH ACADEMY - Digital Skills*
For any queries, please contact us.`;

    return customMessage || baseMessage;
  };

  const handleWhatsAppShare = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to share the receipt.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);

    try {
      let message = await generateReceiptMessage();

      if (generatePDF) {
        const pdfContent = await generatePDF();
        if (pdfContent) {
          message = `📄 *Fee Receipt Image Generated*\n\n${message}\n\n📎 *Receipt image has been downloaded to your device. Please attach it manually to WhatsApp.*`;
        }
      }

      const cleanPhone = phoneNumber.replace(/\D/g, "");

      let formattedPhone = cleanPhone;
      if (!cleanPhone.startsWith("92") && cleanPhone.length === 11) {
        formattedPhone = "92" + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith("92") && cleanPhone.length === 10) {
        formattedPhone = "92" + cleanPhone;
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      toast({
        title: "WhatsApp Opened",
        description: generatePDF
          ? "Receipt image downloaded! Please attach it manually in WhatsApp."
          : "Receipt shared via WhatsApp successfully!",
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleQuickShare = async () => {
    setIsGeneratingPDF(true);

    try {
      let message = await generateReceiptMessage();

      if (generatePDF) {
        const pdfContent = await generatePDF();
        if (pdfContent) {
          message = `📄 *Fee Receipt Image Generated*\n\n${message}\n\n📎 *Receipt image has been downloaded to your device. Please attach it manually to WhatsApp.*`;
        }
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      toast({
        title: "WhatsApp Opened",
        description: generatePDF
          ? "Receipt image downloaded! Please attach it manually in WhatsApp."
          : "Receipt ready to share. Select contact in WhatsApp.",
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [previewMessage, setPreviewMessage] = useState("");

  const updatePreviewMessage = async () => {
    const message = await generateReceiptMessage();
    setPreviewMessage(message.substring(0, 200) + "...");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WhatsAppIcon />
            {generatePDF
              ? "Share Receipt Image via WhatsApp"
              : "Share Receipt via WhatsApp"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="03001234567 or +923001234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-animate"
            />
            <p className="text-xs text-muted-foreground">
              Enter phone number with country code (Pakistan: +92)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message or leave empty for default receipt message..."
              value={customMessage}
              onChange={(e) => {
                setCustomMessage(e.target.value);
                updatePreviewMessage();
              }}
              rows={3}
              className="input-animate"
            />
          </div>

          <div className="space-y-2">
            <Label>Preview Message:</Label>
            <div className="bg-muted p-3 rounded-md text-sm max-h-32 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-xs">
                {previewMessage}
              </pre>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleWhatsAppShare}
              className="flex-1 btn-animate"
              disabled={isGeneratingPDF}
            >
              <WhatsAppIcon />
              {isGeneratingPDF ? "Generating..." : "Send to Number"}
            </Button>
            <Button
              variant="outline"
              onClick={handleQuickShare}
              className="flex-1 btn-animate bg-transparent"
              disabled={isGeneratingPDF}
            >
              <WhatsAppIcon />
              {isGeneratingPDF ? "Generating..." : "Choose Contact"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {generatePDF
              ? "This will generate a receipt image, download it to your device, and open WhatsApp. You can then manually attach the downloaded image."
              : "This will open WhatsApp with the receipt details pre-filled"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
