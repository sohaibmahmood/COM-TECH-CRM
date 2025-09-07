-- Fix the fee reminder logic to trigger after 30 days from payment_date
-- This updates the existing functions to use the correct logic

-- Update the get_overdue_payments function
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

-- Update the schedule_next_reminder function
CREATE OR REPLACE FUNCTION schedule_next_reminder(
  student_id_param UUID,
  receipt_id_param UUID,
  interval_days INTEGER DEFAULT 6
)
RETURNS UUID AS $$
DECLARE
  reminder_id UUID;
  student_data RECORD;
  receipt_data RECORD;
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

-- Test the updated function
SELECT 
  'Testing updated function' as test_info,
  COUNT(*) as overdue_count
FROM get_overdue_payments(30);

-- Show some sample data to verify the logic
SELECT 
  student_name,
  roll_number,
  payment_date,
  remaining_due,
  days_overdue,
  CASE 
    WHEN days_overdue <= 0 THEN 'Not yet due'
    WHEN days_overdue <= 7 THEN 'Recently overdue'
    WHEN days_overdue <= 30 THEN 'Moderately overdue'
    ELSE 'Critically overdue'
  END as status
FROM get_overdue_payments(30)
ORDER BY days_overdue DESC
LIMIT 10;
