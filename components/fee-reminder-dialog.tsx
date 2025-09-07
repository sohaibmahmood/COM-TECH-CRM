"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { formatPKR } from "@/lib/utils";
import { useFeeReminders } from "@/hooks/use-fee-reminders";
import { MessageSquare, Phone, Mail, Copy, ExternalLink } from "lucide-react";
import type { StudentWithOverdue } from "@/lib/fee-reminders";

const WhatsAppIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

interface FeeReminderDialogProps {
  children: React.ReactNode;
  student: StudentWithOverdue;
}

export function FeeReminderDialog({
  children,
  student,
}: FeeReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateMessage, sendReminder } = useFeeReminders();
  const { toast } = useToast();

  // Generate message when dialog opens
  useEffect(() => {
    if (open && !message) {
      generateDefaultMessage();
    }
  }, [open]);

  const generateDefaultMessage = async () => {
    setIsGenerating(true);
    try {
      const generatedMessage = await generateMessage(
        student.student_name,
        student.remaining_due,
        student.days_overdue,
        student.course
      );
      setMessage(generatedMessage);
    } catch (error) {
      console.error("Error generating message:", error);
      toast({
        title: "Error",
        description: "Failed to generate message. Using fallback.",
        variant: "destructive",
      });
      // Fallback message
      setMessage(
        `Dear ${student.student_name}, your fee payment of PKR ${student.remaining_due} is ${student.days_overdue} days overdue. Please pay your student fees. Thank you.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const finalMessage = customMessage.trim() || message;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(finalMessage);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleWhatsAppShare = async () => {
    if (!student.parent_phone) {
      toast({
        title: "No Phone Number",
        description: "Student doesn't have a phone number on file.",
        variant: "destructive",
      });
      return;
    }

    const cleanPhone = student.parent_phone.replace(/\D/g, "");
    let formattedPhone = cleanPhone;

    // Format Pakistani phone numbers
    if (!cleanPhone.startsWith("92") && cleanPhone.length === 11) {
      formattedPhone = "92" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("92") && cleanPhone.length === 10) {
      formattedPhone = "92" + cleanPhone;
    }

    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Optionally track that WhatsApp was opened (for reminder history)
    try {
      await sendReminder(student.student_id, student.receipt_id, "whatsapp");
      toast({
        title: "WhatsApp Opened & Tracked",
        description: "Message prepared in WhatsApp. Reminder has been logged.",
      });
    } catch (error) {
      // If tracking fails, still show success for WhatsApp opening
      toast({
        title: "WhatsApp Opened",
        description: "Message prepared in WhatsApp. Send manually when ready.",
      });
    }

    setOpen(false);
  };

  const handleSendReminder = async (method: "whatsapp" | "email" | "sms") => {
    try {
      await sendReminder(student.student_id, student.receipt_id, method);

      toast({
        title: "Reminder Sent",
        description: `Reminder sent to ${student.student_name} via ${method}`,
      });

      setOpen(false);
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Fee Reminder
          </DialogTitle>
          <DialogDescription>
            Send a payment reminder to {student.student_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Student:</span>{" "}
                {student.student_name}
              </div>
              <div>
                <span className="font-medium">Roll No:</span>{" "}
                {student.roll_number}
              </div>
              <div>
                <span className="font-medium">Class:</span> {student.class}
              </div>
              <div>
                <span className="font-medium">Course:</span> {student.course}
              </div>
              <div>
                <span className="font-medium">Amount Due:</span>
                <span className="text-red-600 font-semibold ml-1">
                  {formatPKR(student.remaining_due)}
                </span>
              </div>
              <div>
                <span className="font-medium">Days Overdue:</span>
                <span className="text-red-600 font-semibold ml-1">
                  {student.days_overdue} days
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label>Contact Information</Label>
            <div className="space-y-1">
              {student.parent_phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  {student.parent_phone}
                </div>
              )}
              {student.parent_email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {student.parent_email}
                </div>
              )}
            </div>
          </div>

          {/* Message Preview */}
          <div className="space-y-2">
            <Label>Generated Message</Label>
            <div className="bg-muted p-3 rounded-md text-sm max-h-40 overflow-y-auto">
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Generating message...
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-sans">{message}</pre>
              )}
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label>Custom Message (Optional)</Label>
            <Textarea
              placeholder="Enter a custom message or leave blank to use the generated message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopyMessage}
              variant="outline"
              className="flex-1"
              disabled={isGenerating}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>

            {student.parent_phone && (
              <Button
                onClick={handleWhatsAppShare}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isGenerating}
              >
                <WhatsAppIcon />
                <span className="ml-2">Open WhatsApp</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          {/* Send Options */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium">Send & Track Reminder</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Mark as sent to track reminder history
            </p>
            <div className="flex gap-2">
              {student.parent_phone && (
                <Button
                  onClick={() => handleSendReminder("whatsapp")}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  <WhatsAppIcon />
                  <span className="ml-1">Mark as Sent (WhatsApp)</span>
                </Button>
              )}
              {student.parent_email && (
                <Button
                  onClick={() => handleSendReminder("email")}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Mark as Sent (Email)
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
