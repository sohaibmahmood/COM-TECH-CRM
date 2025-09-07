-- Add flexible fee structure to support fee negotiations
-- This migration adds final_fee_amount to students table while keeping class-based pricing as reference

-- Step 1: Add final_fee_amount column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS final_fee_amount DECIMAL(10,2);

-- Step 2: Add discount tracking columns for analytics
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS standard_fee_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;

-- Step 3: Create function to calculate discount information
CREATE OR REPLACE FUNCTION calculate_student_discount(
  student_id_param UUID
)
RETURNS TABLE (
  standard_fee DECIMAL(10,2),
  final_fee DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  discount_percentage DECIMAL(5,2)
) AS $$
DECLARE
  student_record RECORD;
  class_record RECORD;
  calculated_discount DECIMAL(10,2);
  calculated_percentage DECIMAL(5,2);
BEGIN
  -- Get student data
  SELECT s.class, s.final_fee_amount, s.standard_fee_amount
  INTO student_record
  FROM students s
  WHERE s.id = student_id_param;

  -- Get class fee data
  SELECT c.fee_amount
  INTO class_record
  FROM classes c
  WHERE c.class_name = student_record.class;

  -- Use stored standard fee or class fee as fallback
  standard_fee := COALESCE(student_record.standard_fee_amount, class_record.fee_amount, 0);
  final_fee := COALESCE(student_record.final_fee_amount, standard_fee);
  
  -- Calculate discount
  calculated_discount := standard_fee - final_fee;
  calculated_percentage := CASE 
    WHEN standard_fee > 0 THEN (calculated_discount / standard_fee) * 100
    ELSE 0
  END;

  discount_amount := calculated_discount;
  discount_percentage := calculated_percentage;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to update student fee information
CREATE OR REPLACE FUNCTION update_student_fee_structure(
  student_id_param UUID,
  final_fee_param DECIMAL(10,2)
)
RETURNS VOID AS $$
DECLARE
  student_class TEXT;
  standard_fee DECIMAL(10,2);
  discount_amt DECIMAL(10,2);
  discount_pct DECIMAL(5,2);
BEGIN
  -- Get student's class
  SELECT class INTO student_class
  FROM students
  WHERE id = student_id_param;

  -- Get standard fee for the class
  SELECT fee_amount INTO standard_fee
  FROM classes
  WHERE class_name = student_class;

  -- Calculate discount
  discount_amt := standard_fee - final_fee_param;
  discount_pct := CASE 
    WHEN standard_fee > 0 THEN (discount_amt / standard_fee) * 100
    ELSE 0
  END;

  -- Update student record
  UPDATE students
  SET 
    final_fee_amount = final_fee_param,
    standard_fee_amount = standard_fee,
    discount_amount = discount_amt,
    discount_percentage = discount_pct,
    updated_at = NOW()
  WHERE id = student_id_param;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create view for student fee analysis
CREATE OR REPLACE VIEW student_fee_analysis AS
SELECT 
  s.id,
  s.student_name,
  s.roll_number,
  s.class,
  s.course,
  c.fee_amount as class_standard_fee,
  COALESCE(s.standard_fee_amount, c.fee_amount) as standard_fee,
  COALESCE(s.final_fee_amount, c.fee_amount) as final_fee,
  COALESCE(s.discount_amount, 0) as discount_amount,
  COALESCE(s.discount_percentage, 0) as discount_percentage,
  CASE 
    WHEN s.final_fee_amount IS NULL THEN 'Standard Pricing'
    WHEN s.final_fee_amount = c.fee_amount THEN 'No Discount'
    WHEN s.final_fee_amount < c.fee_amount THEN 'Discounted'
    ELSE 'Premium Pricing'
  END as pricing_type,
  s.joining_date,
  s.created_at
FROM students s
LEFT JOIN classes c ON s.class = c.class_name
ORDER BY s.student_name;

-- Step 6: Update existing students with standard pricing (optional)
-- This sets final_fee_amount to class fee for existing students who don't have it set
UPDATE students 
SET 
  final_fee_amount = c.fee_amount,
  standard_fee_amount = c.fee_amount,
  discount_amount = 0,
  discount_percentage = 0
FROM classes c
WHERE students.class = c.class_name 
  AND students.final_fee_amount IS NULL;

-- Step 7: Create trigger to auto-calculate discount when final_fee_amount is updated
CREATE OR REPLACE FUNCTION trigger_calculate_student_discount()
RETURNS TRIGGER AS $$
DECLARE
  standard_fee DECIMAL(10,2);
  discount_amt DECIMAL(10,2);
  discount_pct DECIMAL(5,2);
BEGIN
  -- Get standard fee for the class
  SELECT fee_amount INTO standard_fee
  FROM classes
  WHERE class_name = NEW.class;

  -- Calculate discount if final_fee_amount is provided
  IF NEW.final_fee_amount IS NOT NULL THEN
    NEW.standard_fee_amount := standard_fee;
    discount_amt := standard_fee - NEW.final_fee_amount;
    discount_pct := CASE 
      WHEN standard_fee > 0 THEN (discount_amt / standard_fee) * 100
      ELSE 0
    END;
    
    NEW.discount_amount := discount_amt;
    NEW.discount_percentage := discount_pct;
  ELSE
    -- If no final fee specified, use standard pricing
    NEW.final_fee_amount := standard_fee;
    NEW.standard_fee_amount := standard_fee;
    NEW.discount_amount := 0;
    NEW.discount_percentage := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_student_fee_calculation ON students;
CREATE TRIGGER trigger_student_fee_calculation
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_student_discount();

-- Step 8: Create analytics functions for fee structure reporting
CREATE OR REPLACE FUNCTION get_fee_structure_analytics()
RETURNS TABLE (
  total_students INTEGER,
  students_with_discounts INTEGER,
  average_discount_percentage DECIMAL(5,2),
  total_standard_revenue DECIMAL(12,2),
  total_actual_revenue DECIMAL(12,2),
  total_discount_amount DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_students,
    COUNT(CASE WHEN discount_percentage > 0 THEN 1 END)::INTEGER as students_with_discounts,
    COALESCE(AVG(CASE WHEN discount_percentage > 0 THEN discount_percentage END), 0)::DECIMAL(5,2) as average_discount_percentage,
    COALESCE(SUM(standard_fee_amount), 0)::DECIMAL(12,2) as total_standard_revenue,
    COALESCE(SUM(final_fee_amount), 0)::DECIMAL(12,2) as total_actual_revenue,
    COALESCE(SUM(discount_amount), 0)::DECIMAL(12,2) as total_discount_amount
  FROM students
  WHERE final_fee_amount IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Update fee receipts to use final fee amount
-- Create function to get student's final fee amount
CREATE OR REPLACE FUNCTION get_student_final_fee(student_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  final_fee DECIMAL(10,2);
  class_fee DECIMAL(10,2);
BEGIN
  -- Get student's final fee amount
  SELECT s.final_fee_amount, c.fee_amount
  INTO final_fee, class_fee
  FROM students s
  LEFT JOIN classes c ON s.class = c.class_name
  WHERE s.id = student_id_param;

  -- Return final fee if set, otherwise return class fee
  RETURN COALESCE(final_fee, class_fee, 0);
END;
$$ LANGUAGE plpgsql;

-- Step 10: Verification queries
DO $$
BEGIN
  RAISE NOTICE 'Flexible Fee Structure Setup Complete!';
  RAISE NOTICE 'New columns added: final_fee_amount, standard_fee_amount, discount_amount, discount_percentage';
  RAISE NOTICE 'Functions created: calculate_student_discount, update_student_fee_structure, get_student_final_fee';
  RAISE NOTICE 'View created: student_fee_analysis';
  RAISE NOTICE 'Trigger created: trigger_student_fee_calculation';
END $$;

-- Show current fee structure status
SELECT
  'Fee Structure Status' as component,
  COUNT(*) as total_students,
  COUNT(CASE WHEN final_fee_amount IS NOT NULL THEN 1 END) as students_with_final_fee,
  COUNT(CASE WHEN discount_percentage > 0 THEN 1 END) as students_with_discounts
FROM students;

-- Update get_overdue_payments to use student's final fee amount
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
  last_reminder_date DATE,
  student_final_fee DECIMAL(10,2)
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
    (SELECT MAX(reminder_date) FROM fee_reminders WHERE receipt_id = fr.id) as last_reminder_date,
    COALESCE(s.final_fee_amount, c.fee_amount, 0) as student_final_fee
  FROM students s
  JOIN fee_receipts fr ON s.id = fr.student_id
  LEFT JOIN classes c ON s.class = c.class_name
  WHERE fr.remaining_due > 0
    AND (fr.payment_date + INTERVAL '1 day' * grace_period_days) < CURRENT_DATE
  ORDER BY days_overdue DESC, s.student_name;
END;
$$ LANGUAGE plpgsql;
