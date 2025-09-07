import { createClient } from "@/lib/supabase/client";

export interface DatabaseTestResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  count?: number;
  data?: any;
}

export async function runComprehensiveDatabaseTest(): Promise<{
  results: DatabaseTestResult[];
  overallStatus: 'success' | 'error' | 'warning';
  isRealData: boolean;
}> {
  const supabase = createClient();
  const results: DatabaseTestResult[] = [];
  let isRealData = true;

  try {
    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });
      if (error) throw error;
      
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
      isRealData = false;
    }

    // Test 2: Students Table with Real Data Check
    try {
      const { data: students, error, count } = await supabase
        .from('students')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      // Check if data looks real (not dummy/mock data)
      const hasRealData = students && students.length > 0 && 
        !students.some(s => 
          s.student_name?.toLowerCase().includes('test') ||
          s.student_name?.toLowerCase().includes('dummy') ||
          s.student_name?.toLowerCase().includes('sample')
        );

      results.push({
        component: 'Students Table',
        status: 'success',
        message: `Students table accessible with ${count || 0} records${hasRealData ? ' (real data)' : ' (test/dummy data)'}`,
        count: count || 0,
        data: students?.slice(0, 3) // Sample data for verification
      });

      if (!hasRealData && (count || 0) > 0) {
        isRealData = false;
      }
    } catch (error) {
      results.push({
        component: 'Students Table',
        status: 'error',
        message: `Students table error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      isRealData = false;
    }

    // Test 3: Fee Receipts with Real Data Check
    try {
      const { data: receipts, error, count } = await supabase
        .from('fee_receipts')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      // Check for real receipt data
      const hasRealReceipts = receipts && receipts.length > 0 &&
        receipts.some(r => r.receipt_number && !r.receipt_number.includes('TEST'));

      results.push({
        component: 'Fee Receipts Table',
        status: 'success',
        message: `Fee receipts table accessible with ${count || 0} records${hasRealReceipts ? ' (real data)' : ' (test/dummy data)'}`,
        count: count || 0,
        data: receipts?.slice(0, 3)
      });

      if (!hasRealReceipts && (count || 0) > 0) {
        isRealData = false;
      }
    } catch (error) {
      results.push({
        component: 'Fee Receipts Table',
        status: 'error',
        message: `Fee receipts table error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: Classes Table
    try {
      const { data: classes, error, count } = await supabase
        .from('classes')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      results.push({
        component: 'Classes Table',
        status: 'success',
        message: `Classes table accessible with ${count || 0} records`,
        count: count || 0,
        data: classes
      });
    } catch (error) {
      results.push({
        component: 'Classes Table',
        status: 'error',
        message: `Classes table error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: CRUD Operations Test
    try {
      const testStudent = {
        student_name: 'Database Test Student',
        roll_number: `TEST-${Date.now()}`,
        class: '9th',
        course: 'Test Course',
        joining_date: new Date().toISOString().split('T')[0],
        parent_phone: '03001234567',
        parent_email: 'test@example.com',
        address: 'Test Address',
        notes: 'Automated test record - will be deleted'
      };

      // Test INSERT
      const { data: insertData, error: insertError } = await supabase
        .from('students')
        .insert([testStudent])
        .select()
        .single();

      if (insertError) throw insertError;

      // Test UPDATE
      const { error: updateError } = await supabase
        .from('students')
        .update({ notes: 'Updated test record' })
        .eq('id', insertData.id);

      if (updateError) throw updateError;

      // Test DELETE
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

    // Test 6: Database Functions
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

    // Test 7: Real-time Subscriptions
    try {
      const channel = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'students' }, 
          (payload) => console.log('Real-time test:', payload)
        );

      await channel.subscribe();
      await channel.unsubscribe();

      results.push({
        component: 'Real-time Subscriptions',
        status: 'success',
        message: 'Real-time subscriptions working correctly'
      });
    } catch (error) {
      results.push({
        component: 'Real-time Subscriptions',
        status: 'warning',
        message: 'Real-time subscriptions not available'
      });
    }

  } catch (error) {
    results.push({
      component: 'Overall Test',
      status: 'error',
      message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    isRealData = false;
  }

  // Determine overall status
  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');
  
  let overallStatus: 'success' | 'error' | 'warning';
  if (hasErrors) {
    overallStatus = 'error';
  } else if (hasWarnings) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'success';
  }

  return {
    results,
    overallStatus,
    isRealData
  };
}

export async function verifyRealDataUsage(): Promise<{
  isUsingRealData: boolean;
  summary: string;
  details: string[];
}> {
  const supabase = createClient();
  const details: string[] = [];
  let isUsingRealData = true;

  try {
    // Check students data
    const { data: students } = await supabase.from('students').select('*').limit(10);
    if (students && students.length > 0) {
      const realStudents = students.filter(s => 
        !s.student_name?.toLowerCase().includes('test') &&
        !s.student_name?.toLowerCase().includes('dummy') &&
        !s.student_name?.toLowerCase().includes('sample')
      );
      
      if (realStudents.length === students.length) {
        details.push(`✅ Students: ${students.length} real student records found`);
      } else {
        details.push(`⚠️ Students: ${realStudents.length}/${students.length} appear to be real data`);
        if (realStudents.length === 0) isUsingRealData = false;
      }
    } else {
      details.push(`📝 Students: No student data found - add real students to get started`);
    }

    // Check receipts data
    const { data: receipts } = await supabase.from('fee_receipts').select('*').limit(10);
    if (receipts && receipts.length > 0) {
      const realReceipts = receipts.filter(r => 
        r.receipt_number && !r.receipt_number.includes('TEST')
      );
      
      if (realReceipts.length === receipts.length) {
        details.push(`✅ Receipts: ${receipts.length} real receipt records found`);
      } else {
        details.push(`⚠️ Receipts: ${realReceipts.length}/${receipts.length} appear to be real data`);
        if (realReceipts.length === 0) isUsingRealData = false;
      }
    } else {
      details.push(`📝 Receipts: No receipt data found - create real receipts to track payments`);
    }

    // Check classes data
    const { data: classes } = await supabase.from('classes').select('*');
    if (classes && classes.length > 0) {
      details.push(`✅ Classes: ${classes.length} class definitions found`);
    } else {
      details.push(`❌ Classes: No class data found - run database setup script`);
      isUsingRealData = false;
    }

  } catch (error) {
    details.push(`❌ Error checking data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    isUsingRealData = false;
  }

  const summary = isUsingRealData 
    ? "✅ System is using real database data"
    : "⚠️ System may be using test/dummy data or needs setup";

  return {
    isUsingRealData,
    summary,
    details
  };
}
