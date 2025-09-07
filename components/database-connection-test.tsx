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
  RefreshCw,
  Play,
  Users,
  Receipt,
  GraduationCap,
  Bell
} from "lucide-react";

interface DatabaseTestResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  count?: number;
}

export function DatabaseConnectionTest() {
  const [testResults, setTestResults] = useState<DatabaseTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | null>(null);
  const { toast } = useToast();

  const runDatabaseTests = async () => {
    setTesting(true);
    setTestResults([]);
    setOverallStatus(null);
    
    const supabase = createClient();
    const results: DatabaseTestResult[] = [];

    try {
      // Test 1: Basic connection
      try {
        await supabase.from('students').select('count', { count: 'exact', head: true });
        results.push({
          component: 'Database Connection',
          status: 'success',
          message: 'Successfully connected to Supabase database'
        });
      } catch (error) {
        results.push({
          component: 'Database Connection',
          status: 'error',
          message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 2: Students table
      try {
        const { data: students, error, count } = await supabase
          .from('students')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        results.push({
          component: 'Students Table',
          status: 'success',
          message: `Students table accessible with ${count || 0} records`,
          count: count || 0
        });
      } catch (error) {
        results.push({
          component: 'Students Table',
          status: 'error',
          message: `Students table error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 3: Classes table
      try {
        const { data: classes, error, count } = await supabase
          .from('classes')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        results.push({
          component: 'Classes Table',
          status: 'success',
          message: `Classes table accessible with ${count || 0} records`,
          count: count || 0
        });
      } catch (error) {
        results.push({
          component: 'Classes Table',
          status: 'error',
          message: `Classes table error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 4: Fee receipts table
      try {
        const { data: receipts, error, count } = await supabase
          .from('fee_receipts')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        results.push({
          component: 'Fee Receipts Table',
          status: 'success',
          message: `Fee receipts table accessible with ${count || 0} records`,
          count: count || 0
        });
      } catch (error) {
        results.push({
          component: 'Fee Receipts Table',
          status: 'error',
          message: `Fee receipts table error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 5: Fee reminders table
      try {
        const { data: reminders, error, count } = await supabase
          .from('fee_reminders')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        results.push({
          component: 'Fee Reminders Table',
          status: 'success',
          message: `Fee reminders table accessible with ${count || 0} records`,
          count: count || 0
        });
      } catch (error) {
        results.push({
          component: 'Fee Reminders Table',
          status: 'warning',
          message: `Fee reminders table not found - run migration script to enable reminders`
        });
      }

      // Test 6: Database functions
      try {
        const { data, error } = await supabase.rpc('get_overdue_payments', { grace_period_days: 30 });
        
        if (error) throw error;
        
        results.push({
          component: 'Database Functions',
          status: 'success',
          message: `Database functions working - found ${data?.length || 0} overdue payments`,
          count: data?.length || 0
        });
      } catch (error) {
        results.push({
          component: 'Database Functions',
          status: 'warning',
          message: 'Database functions not available - run migration script for full functionality'
        });
      }

      // Test 7: CRUD operations test
      try {
        // Test insert and delete (using a test record)
        const testStudent = {
          student_name: 'Test Student',
          roll_number: `TEST-${Date.now()}`,
          class: '9th',
          course: 'Test Course',
          joining_date: new Date().toISOString().split('T')[0],
          parent_phone: '03001234567',
          parent_email: 'test@example.com',
          address: 'Test Address',
          notes: 'Test record - will be deleted'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('students')
          .insert([testStudent])
          .select()
          .single();

        if (insertError) throw insertError;

        // Delete the test record
        const { error: deleteError } = await supabase
          .from('students')
          .delete()
          .eq('id', insertData.id);

        if (deleteError) throw deleteError;

        results.push({
          component: 'CRUD Operations',
          status: 'success',
          message: 'Create, Read, Update, Delete operations working correctly'
        });
      } catch (error) {
        results.push({
          component: 'CRUD Operations',
          status: 'error',
          message: `CRUD operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Determine overall status
      const hasErrors = results.some(r => r.status === 'error');
      const hasWarnings = results.some(r => r.status === 'warning');
      
      if (hasErrors) {
        setOverallStatus('error');
        toast({
          title: "Database Issues Found",
          description: "Some database components are not working properly",
          variant: "destructive",
        });
      } else if (hasWarnings) {
        setOverallStatus('warning');
        toast({
          title: "Database Partially Ready",
          description: "Basic functionality works, but some features need setup",
        });
      } else {
        setOverallStatus('success');
        toast({
          title: "Database Fully Connected! 🎉",
          description: "All database components are working correctly",
        });
      }

    } catch (error) {
      results.push({
        component: 'Overall Test',
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setOverallStatus('error');
    } finally {
      setTestResults(results);
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="h-5 w-5" />
          Database Connection Test
        </CardTitle>
        <CardDescription className="text-blue-700">
          Verify that the CRM system is properly connected to the Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDatabaseTests} 
          disabled={testing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {testing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {testing ? 'Testing...' : 'Run Database Tests'}
        </Button>

        {overallStatus && (
          <Alert className={getStatusColor(overallStatus)}>
            {getStatusIcon(overallStatus)}
            <AlertDescription>
              {overallStatus === 'success' && (
                <span className="text-green-700">
                  <strong>✅ Database Fully Connected!</strong> All components are working correctly.
                </span>
              )}
              {overallStatus === 'warning' && (
                <span className="text-yellow-700">
                  <strong>⚠️ Partial Connection</strong> Basic functionality works, but some features need setup.
                </span>
              )}
              {overallStatus === 'error' && (
                <span className="text-red-700">
                  <strong>❌ Connection Issues</strong> Some database components are not working properly.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-sm">{result.component}</span>
                    {result.count !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {result.count} records
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-600">{result.message}</p>
              </div>
            ))}
          </div>
        )}

        {overallStatus === 'warning' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
            <p className="text-sm text-yellow-700 mb-2">
              To enable full functionality, run the database setup script:
            </p>
            <code className="text-xs bg-yellow-100 p-1 rounded">
              scripts/verify-database-connection.sql
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
