-- Complete Fee Reminders Setup Script for Supabase
-- Run this entire script in your Supabase SQL Editor to set up the fee reminders system

-- Step 1: Create fee_reminders table
CREATE TABLE IF NOT EXISTS fee_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL REFERENCES fee_receipts(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL DEFAULT 'overdue_payment',
  reminder_date DATE NOT NULL,
  due_amount DECIMAL(10,2) NOT NULL,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  message_template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_via TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_reminders_student_id ON fee_reminders(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_receipt_id ON fee_reminders(receipt_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_reminder_date ON fee_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_status ON fee_reminders(status);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_days_overdue ON fee_reminders(days_overdue);

-- Step 3: Enable Row Level Security
ALTER TABLE fee_reminders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy for public access (since this is an admin system)
CREATE POLICY "Allow all operations on fee_reminders" ON fee_reminders FOR ALL USING (true);

-- Step 5: Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_fee_reminders_updated_at ON fee_reminders;
CREATE TRIGGER trigger_fee_reminders_updated_at
  BEFORE UPDATE ON fee_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create function to identify overdue payments (30-day logic)
CREATE OR REPLACE FUNCTION get_overdue_payments(grace_period_days INTEGER DEFAULT 30)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  roll_number TEXT,
  class TEXT,
  course TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  receipt_id UUID,
  receipt_number TEXT,
  payment_date DATE,
  total_fee DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  remaining_due DECIMAL(10,2),
  days_overdue INTEGER,
  last_reminder_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as student_id,
    s.student_name,
    s.roll_number,
    s.class,
    s.course,
    s.parent_phone,
    s.parent_email,
    fr.id as receipt_id,
    fr.receipt_number,
    fr.payment_date,
    fr.total_fee,
    fr.paid_amount,
    fr.remaining_due,
    (CURRENT_DATE - (fr.payment_date + INTERVAL '1 day' * grace_period_days))::INTEGER as days_overdue,
    (SELECT MAX(reminder_date) FROM fee_reminders WHERE receipt_id = fr.id) as last_reminder_date
  FROM students s
  JOIN fee_receipts fr ON s.id = fr.student_id
  WHERE fr.remaining_due > 0
    AND (fr.payment_date + INTERVAL '1 day' * grace_period_days) < CURRENT_DATE
  ORDER BY days_overdue DESC, s.student_name;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create function to generate reminder messages
CREATE OR REPLACE FUNCTION generate_reminder_message(
  student_name_param TEXT,
  remaining_due_param DECIMAL(10,2),
  days_overdue_param INTEGER,
  course_param TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  message TEXT;
  urgency_level TEXT;
  formatted_amount TEXT;
BEGIN
  -- Format amount
  formatted_amount := 'PKR ' || remaining_due_param::TEXT;
  
  -- Determine urgency level based on days overdue
  IF days_overdue_param <= 7 THEN
    urgency_level := 'gentle';
  ELSIF days_overdue_param <= 30 THEN
    urgency_level := 'moderate';
  ELSE
    urgency_level := 'urgent';
  END IF;

  -- Generate message based on urgency level
  CASE urgency_level
    WHEN 'gentle' THEN
      message := '🎓 *COM-TECH ACADEMY - Fee Reminder*

Dear ' || student_name_param || ',

This is a friendly reminder that your course fee payment is pending.

💰 *Outstanding Amount:* ' || formatted_amount || '
📅 *Days Overdue:* ' || days_overdue_param::TEXT || ' days
' || CASE WHEN course_param IS NOT NULL THEN '📚 *Course:* ' || course_param || E'\n' ELSE '' END || '
Please make your payment at your earliest convenience to continue your studies without interruption.

Thank you for your attention to this matter.

*COM-TECH ACADEMY - Digital Skills*
For payment assistance, please contact us.';

    WHEN 'moderate' THEN
      message := '⚠️ *COM-TECH ACADEMY - Payment Reminder*

Dear ' || student_name_param || ',

Your course fee payment is now overdue and requires immediate attention.

💰 *Outstanding Amount:* ' || formatted_amount || '
📅 *Days Overdue:* ' || days_overdue_param::TEXT || ' days
' || CASE WHEN course_param IS NOT NULL THEN '📚 *Course:* ' || course_param || E'\n' ELSE '' END || '
Please settle your outstanding balance to avoid any disruption to your studies.

*Payment is required within the next 7 days.*

*COM-TECH ACADEMY - Digital Skills*
Contact us immediately for payment arrangements.';

    WHEN 'urgent' THEN
      message := '🚨 *COM-TECH ACADEMY - URGENT Payment Notice*

Dear ' || student_name_param || ',

Your course fee payment is significantly overdue and requires IMMEDIATE action.

💰 *Outstanding Amount:* ' || formatted_amount || '
📅 *Days Overdue:* ' || days_overdue_param::TEXT || ' days
' || CASE WHEN course_param IS NOT NULL THEN '📚 *Course:* ' || course_param || E'\n' ELSE '' END || '
⚠️ *IMPORTANT:* Your enrollment may be suspended if payment is not received within 3 days.

Please contact us IMMEDIATELY to resolve this matter.

*COM-TECH ACADEMY - Digital Skills*
URGENT: Call us now for immediate assistance.';
  END CASE;

  RETURN message;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create function to schedule next reminder
CREATE OR REPLACE FUNCTION schedule_next_reminder(
  student_id_param UUID,
  receipt_id_param UUID,
  interval_days INTEGER DEFAULT 6
)
RETURNS UUID AS $$
DECLARE
  reminder_id UUID;
  student_data RECORD;
  days_overdue INTEGER;
  message_text TEXT;
BEGIN
  -- Get student and receipt data
  SELECT s.student_name, s.course, fr.remaining_due, fr.payment_date
  INTO student_data
  FROM students s
  JOIN fee_receipts fr ON s.id = fr.student_id
  WHERE s.id = student_id_param AND fr.id = receipt_id_param;

  -- Calculate days overdue (30 days after payment_date)
  days_overdue := (CURRENT_DATE - (student_data.payment_date + INTERVAL '30 days'))::INTEGER;

  -- Generate reminder message
  message_text := generate_reminder_message(
    student_data.student_name,
    student_data.remaining_due,
    days_overdue,
    student_data.course
  );

  -- Insert new reminder
  INSERT INTO fee_reminders (
    student_id,
    receipt_id,
    reminder_type,
    reminder_date,
    due_amount,
    days_overdue,
    message_template,
    status
  ) VALUES (
    student_id_param,
    receipt_id_param,
    'overdue_payment',
    CURRENT_DATE + INTERVAL '1 day' * interval_days,
    student_data.remaining_due,
    days_overdue,
    message_text,
    'pending'
  ) RETURNING id INTO reminder_id;

  RETURN reminder_id;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Test the setup
DO $$
BEGIN
  RAISE NOTICE 'Fee Reminders System Setup Complete!';
  RAISE NOTICE 'Tables created: fee_reminders';
  RAISE NOTICE 'Functions created: get_overdue_payments, generate_reminder_message, schedule_next_reminder';
  RAISE NOTICE 'You can now use the Fee Reminders page in your CRM system.';
END $$;

-- Step 11: Show current status
SELECT 
  'Setup Verification' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fee_reminders') 
    THEN 'fee_reminders table: ✅ Created' 
    ELSE 'fee_reminders table: ❌ Not Found' 
  END as status
UNION ALL
SELECT 
  'Functions Check' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_overdue_payments') 
    THEN 'get_overdue_payments: ✅ Created' 
    ELSE 'get_overdue_payments: ❌ Not Found' 
  END as status
UNION ALL
SELECT 
  'Message Function' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'generate_reminder_message') 
    THEN 'generate_reminder_message: ✅ Created' 
    ELSE 'generate_reminder_message: ❌ Not Found' 
  END as status;

-- Step 12: Show sample data (if any overdue payments exist)
SELECT 
  'Sample Overdue Data' as info,
  COUNT(*) as overdue_count,
  COALESCE(SUM(remaining_due), 0) as total_overdue_amount
FROM fee_receipts 
WHERE remaining_due > 0 
  AND (payment_date + INTERVAL '30 days') < CURRENT_DATE;
