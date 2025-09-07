-- Create students table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fee_receipts table
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

-- Create classes table for managing different classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  fee_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default classes
INSERT INTO classes (class_name, course_name, fee_amount) VALUES
('9th', 'Computer Science Fundamentals', 1000.00),
('10th', 'Advanced Computer Science', 1200.00),
('11th', 'Programming & Web Development', 1500.00),
('12th', 'Software Engineering', 1800.00)
ON CONFLICT (class_name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin system)
-- In a real-world scenario, you'd want proper user authentication
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all operations on fee_receipts" ON fee_receipts FOR ALL USING (true);
CREATE POLICY "Allow all operations on classes" ON classes FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_student_id ON fee_receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_receipt_number ON fee_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_payment_date ON fee_receipts(payment_date);

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'R' || LPAD(EXTRACT(YEAR FROM NOW())::TEXT, 4, '0') || 
         LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || 
         LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || 
         LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receipt_number IS NULL OR NEW.receipt_number = '' THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_receipt_number
  BEFORE INSERT ON fee_receipts
  FOR EACH ROW
  EXECUTE FUNCTION set_receipt_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_fee_receipts_updated_at
  BEFORE UPDATE ON fee_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
