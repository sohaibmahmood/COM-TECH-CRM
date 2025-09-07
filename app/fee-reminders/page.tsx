import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { FeeReminderStats } from "@/components/fee-reminder-stats";
import { FeeRemindersTable } from "@/components/fee-reminders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Clock, MessageSquare, Info } from "lucide-react";

export default function FeeRemindersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Fee Reminders"
        description="Manage overdue payment reminders and track student fee collections"
      />

      <div className="px-6 space-y-8">
        {/* Information Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Info className="h-5 w-5" />
              How Fee Reminders Work
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Automatic Detection</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>
                    • System identifies students with remaining fee balances
                  </li>
                  <li>• Calculates overdue days based on payment dates</li>
                  <li>
                    • Categorizes urgency levels (Due Soon, Overdue, Critical)
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Manual Sending</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• Generate personalized reminder messages</li>
                  <li>• Send via WhatsApp with one-click integration</li>
                  <li>• Track reminder history and follow-ups</li>
                  <li>• Schedule reminders every 6 days automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reminder Statistics
          </h3>
          <Suspense fallback={<div>Loading statistics...</div>}>
            <FeeReminderStats />
          </Suspense>
        </div>

        {/* Overdue Students Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Students with Overdue Payments
          </h3>
          <Suspense fallback={<div>Loading overdue students...</div>}>
            <FeeRemindersTable />
          </Suspense>
        </div>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reminder Schedule & Best Practices
            </CardTitle>
            <CardDescription>
              Guidelines for effective fee reminder management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Reminder Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>
                      <strong>Due Soon (1-7 days):</strong> Gentle reminder
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>
                      <strong>Overdue (8-30 days):</strong> Moderate urgency
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>
                      <strong>Critical (30+ days):</strong> Urgent action
                      required
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Best Practices</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Send reminders during business hours (9 AM - 6 PM)</li>
                  <li>• Use personalized messages with student names</li>
                  <li>• Follow up every 6 days for overdue payments</li>
                  <li>• Escalate critical cases to direct phone calls</li>
                  <li>• Keep track of reminder history for each student</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
