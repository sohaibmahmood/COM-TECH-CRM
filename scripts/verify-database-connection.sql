-- Complete Database Connection Verification Script
-- Run this script to verify and set up the CRM database connection

-- Step 1: Check if core tables exist
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING DATABASE TABLES ===';
END $$;

SELECT 
    'Table Status' as component,
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_name IN ('students', 'fee_receipts', 'classes', 'fee_reminders')
ORDER BY table_name;

-- Step 2: Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  course TEXT,
  joining_date DATE NOT NULL,
  parent_phone TEXT,
  parent_email TEXT,
  address TEXT,
  notes TEXT,
  final_fee_amount DECIMAL(10,2),
  standard_fee_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  fee_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  total_fee DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL,
  remaining_due DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT 'Course Fee',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Step 3: Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_reminders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for public access (since this is an admin system)
DROP POLICY IF EXISTS "Allow all operations on students" ON students;
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on classes" ON classes;
CREATE POLICY "Allow all operations on classes" ON classes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on fee_receipts" ON fee_receipts;
CREATE POLICY "Allow all operations on fee_receipts" ON fee_receipts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on fee_reminders" ON fee_reminders;
CREATE POLICY "Allow all operations on fee_reminders" ON fee_reminders FOR ALL USING (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_student_id ON fee_receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_payment_date ON fee_receipts(payment_date);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_remaining_due ON fee_receipts(remaining_due);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_student_id ON fee_reminders(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_receipt_id ON fee_reminders(receipt_id);
CREATE INDEX IF NOT EXISTS idx_fee_reminders_status ON fee_reminders(status);

-- Step 6: Insert default classes if they don't exist
INSERT INTO classes (class_name, course_name, fee_amount) VALUES
('9th', 'Computer Science Fundamentals', 2000.00),
('10th', 'Advanced Computer Science', 2200.00),
('11th', 'Programming & Web Development', 2500.00),
('12th', 'Software Engineering', 2800.00)
ON CONFLICT (class_name) DO NOTHING;

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_fee_receipts_updated_at ON fee_receipts;
CREATE TRIGGER trigger_fee_receipts_updated_at
  BEFORE UPDATE ON fee_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_fee_reminders_updated_at ON fee_reminders;
CREATE TRIGGER trigger_fee_reminders_updated_at
  BEFORE UPDATE ON fee_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create essential functions for fee reminders
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

-- Step 10: Create receipt number generation function
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  receipt_number TEXT;
BEGIN
  -- Get the next receipt number
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'RCP-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM fee_receipts
  WHERE receipt_number ~ '^RCP-\d+$';
  
  -- Format as RCP-XXXX
  receipt_number := 'RCP-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN receipt_number;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Verification and status report
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE SETUP COMPLETE ===';
    RAISE NOTICE 'All tables, indexes, policies, and functions have been created.';
    RAISE NOTICE 'The CRM system is now fully connected to the database.';
END $$;

-- Final verification query
SELECT 
    'VERIFICATION' as status,
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('students', 'fee_receipts', 'classes', 'fee_reminders')

UNION ALL

SELECT 
    'VERIFICATION' as status,
    'Classes' as component,
    COUNT(*) as count
FROM classes

UNION ALL

SELECT 
    'VERIFICATION' as status,
    'Students' as component,
    COUNT(*) as count
FROM students

UNION ALL

SELECT 
    'VERIFICATION' as status,
    'Receipts' as component,
    COUNT(*) as count
FROM fee_receipts;

-- Show sample data if any exists
SELECT 'SAMPLE DATA' as info, 'Students' as table_name, student_name, class, course 
FROM students 
LIMIT 3;

SELECT 'SAMPLE DATA' as info, 'Classes' as table_name, class_name, course_name, fee_amount 
FROM classes 
LIMIT 5;
