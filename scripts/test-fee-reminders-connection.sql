-- Test Fee Reminders Database Connection
-- Run this script to verify everything is working correctly

-- Test 1: Check if tables exist
SELECT 
  'Table Check' as test_name,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_name IN ('students', 'fee_receipts', 'fee_reminders', 'classes')
ORDER BY table_name;

-- Test 2: Check if functions exist
SELECT 
  'Function Check' as test_name,
  routine_name as function_name,
  '✅ Available' as status
FROM information_schema.routines 
WHERE routine_name IN ('get_overdue_payments', 'generate_reminder_message', 'schedule_next_reminder')
ORDER BY routine_name;

-- Test 3: Count existing data
SELECT 'Data Count' as test_name, 'students' as table_name, COUNT(*) as record_count FROM students
UNION ALL
SELECT 'Data Count' as test_name, 'fee_receipts' as table_name, COUNT(*) as record_count FROM fee_receipts
UNION ALL
SELECT 'Data Count' as test_name, 'classes' as table_name, COUNT(*) as record_count FROM classes
UNION ALL
SELECT 'Data Count' as test_name, 'fee_reminders' as table_name, COUNT(*) as record_count FROM fee_reminders;

-- Test 4: Check for overdue payments (30-day logic)
SELECT 
  'Overdue Analysis' as test_name,
  COUNT(*) as total_receipts_with_balance,
  COUNT(CASE WHEN (payment_date + INTERVAL '30 days') < CURRENT_DATE THEN 1 END) as overdue_count,
  COALESCE(SUM(CASE WHEN (payment_date + INTERVAL '30 days') < CURRENT_DATE THEN remaining_due ELSE 0 END), 0) as total_overdue_amount
FROM fee_receipts 
WHERE remaining_due > 0;

-- Test 5: Test the get_overdue_payments function
SELECT 
  'Function Test' as test_name,
  'get_overdue_payments(30)' as function_call,
  COUNT(*) as returned_records
FROM get_overdue_payments(30);

-- Test 6: Show sample overdue students (if any)
SELECT 
  student_name,
  roll_number,
  class,
  course,
  payment_date,
  remaining_due,
  days_overdue,
  CASE 
    WHEN days_overdue <= 7 THEN 'Gentle'
    WHEN days_overdue <= 30 THEN 'Moderate'
    ELSE 'Urgent'
  END as urgency_level
FROM get_overdue_payments(30)
ORDER BY days_overdue DESC
LIMIT 5;

-- Test 7: Test message generation
SELECT 
  'Message Test' as test_name,
  generate_reminder_message('Test Student', 5000.00, 15, 'Web Development') as sample_message;

-- Test 8: Show system readiness
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_reminders')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_overdue_payments')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_reminder_message')
    AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'schedule_next_reminder')
    THEN '🎉 Fee Reminders System is READY! You can now use the /fee-reminders page.'
    ELSE '⚠️ Setup incomplete. Please run the setup script first.'
  END as system_status;
