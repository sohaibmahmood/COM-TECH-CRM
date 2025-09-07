"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy,
  RefreshCw,
  Play
} from "lucide-react";

interface DatabaseStatus {
  tablesExist: boolean;
  functionsExist: boolean;
  hasData: boolean;
  overdueCount: number;
  isReady: boolean;
}

export function DatabaseSetupHelper() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupScript, setSetupScript] = useState("");
  const { toast } = useToast();

  const checkDatabaseStatus = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Check if fee_reminders table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('fee_reminders')
        .select('id')
        .limit(1);

      const tablesExist = !tableError;

      // Check if functions exist by trying to call them
      let functionsExist = false;
      try {
        await supabase.rpc('get_overdue_payments', { grace_period_days: 30 });
        functionsExist = true;
      } catch (error) {
        functionsExist = false;
      }

      // Check for existing data
      const { data: receipts } = await supabase
        .from('fee_receipts')
        .select('id')
        .gt('remaining_due', 0)
        .limit(1);

      const hasData = (receipts?.length || 0) > 0;

      // Get overdue count if functions exist
      let overdueCount = 0;
      if (functionsExist) {
        try {
          const { data: overdueData } = await supabase.rpc('get_overdue_payments', { grace_period_days: 30 });
          overdueCount = overdueData?.length || 0;
        } catch (error) {
          console.log('Could not get overdue count:', error);
        }
      }

      const isReady = tablesExist && functionsExist;

      setStatus({
        tablesExist,
        functionsExist,
        hasData,
        overdueCount,
        isReady
      });

      if (isReady) {
        toast({
          title: "Database Ready! 🎉",
          description: "Fee reminders system is fully functional.",
        });
      }

    } catch (error) {
      console.error('Error checking database status:', error);
      toast({
        title: "Connection Error",
        description: "Could not check database status. Please verify your Supabase connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySetupScript = async () => {
    try {
      const response = await fetch('/scripts/setup-fee-reminders-complete.sql');
      const script = await response.text();
      setSetupScript(script);
      await navigator.clipboard.writeText(script);
      toast({
        title: "Script Copied! 📋",
        description: "Setup script copied to clipboard. Paste it in Supabase SQL Editor.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy script. Please copy manually from the file.",
        variant: "destructive",
      });
    }
  };

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Database Setup Helper
        </CardTitle>
        <CardDescription className="text-blue-700">
          Check and set up the fee reminders database functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Check */}
        <div className="flex gap-2">
          <Button 
            onClick={checkDatabaseStatus} 
            disabled={loading}
            variant="outline"
            className="bg-white"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Check Database Status
          </Button>
        </div>

        {/* Status Display */}
        {status && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                {status.tablesExist ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  Tables: {status.tablesExist ? "✅ Created" : "❌ Missing"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {status.functionsExist ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  Functions: {status.functionsExist ? "✅ Available" : "❌ Missing"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {status.hasData ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  Data: {status.hasData ? "✅ Available" : "⚠️ No fee data"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={status.overdueCount > 0 ? "destructive" : "secondary"}>
                  {status.overdueCount} Overdue Students
                </Badge>
              </div>
            </div>

            {/* Overall Status */}
            <Alert className={status.isReady ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <AlertDescription className={status.isReady ? "text-green-800" : "text-yellow-800"}>
                {status.isReady ? (
                  "🎉 Fee Reminders system is fully functional! You can now use all features."
                ) : (
                  "⚠️ Setup required. Please run the database migration script below."
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Setup Instructions */}
        {status && !status.isReady && (
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800">Setup Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>Copy the setup script to your clipboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>Open your Supabase dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>Go to SQL Editor and paste the script</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>Run the script and check status again</span>
              </li>
            </ol>

            <div className="flex gap-2">
              <Button 
                onClick={copySetupScript}
                variant="outline"
                className="bg-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Setup Script
              </Button>
              
              <Button 
                onClick={openSupabase}
                variant="outline"
                className="bg-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {status?.isReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">System Ready! 🎉</h4>
            <p className="text-sm text-green-700 mb-3">
              Your fee reminders system is fully functional. You can now:
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• View overdue students ({status.overdueCount} currently overdue)</li>
              <li>• Send WhatsApp reminders</li>
              <li>• Track reminder history</li>
              <li>• Schedule automatic follow-ups</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
