-- Run this script to set up the fee reminders system
-- Execute this in your Supabase SQL editor or database management tool

-- First, run the fee reminders schema
\i scripts/003_fee_reminders_schema.sql

-- Insert some sample reminder data for testing (optional)
-- This will create reminders for students with overdue payments

-- Get students with overdue payments and create initial reminders
INSERT INTO fee_reminders (
  student_id,
  receipt_id,
  reminder_type,
  reminder_date,
  due_amount,
  days_overdue,
  message_template,
  status
)
SELECT 
  s.id as student_id,
  fr.id as receipt_id,
  'overdue_payment' as reminder_type,
  CURRENT_DATE as reminder_date,
  fr.remaining_due as due_amount,
  GREATEST(0, (CURRENT_DATE - (fr.payment_date + INTERVAL '1 month'))::INTEGER) as days_overdue,
  generate_reminder_message(
    s.student_name,
    fr.remaining_due,
    GREATEST(0, (CURRENT_DATE - (fr.payment_date + INTERVAL '1 month'))::INTEGER),
    s.course
  ) as message_template,
  'pending' as status
FROM students s
JOIN fee_receipts fr ON s.id = fr.student_id
WHERE fr.remaining_due > 0
  AND (fr.payment_date + INTERVAL '1 month') < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM fee_reminders 
    WHERE student_id = s.id 
    AND receipt_id = fr.id 
    AND reminder_date = CURRENT_DATE
  )
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
  'Fee Reminders Table' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_reminders') 
    THEN 'Created Successfully' 
    ELSE 'Not Found' 
  END as status
UNION ALL
SELECT 
  'get_overdue_payments Function' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_overdue_payments') 
    THEN 'Created Successfully' 
    ELSE 'Not Found' 
  END as status
UNION ALL
SELECT 
  'generate_reminder_message Function' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_reminder_message') 
    THEN 'Created Successfully' 
    ELSE 'Not Found' 
  END as status
UNION ALL
SELECT 
  'schedule_next_reminder Function' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'schedule_next_reminder') 
    THEN 'Created Successfully' 
    ELSE 'Not Found' 
  END as status;

-- Show current overdue payments
SELECT 
  'Current Overdue Payments' as info,
  COUNT(*) as count
FROM fee_receipts 
WHERE remaining_due > 0;

-- Show created reminders
SELECT 
  'Created Reminders' as info,
  COUNT(*) as count
FROM fee_reminders;

-- Test the get_overdue_payments function
SELECT 
  student_name,
  roll_number,
  remaining_due,
  days_overdue
FROM get_overdue_payments(30)
LIMIT 5;
