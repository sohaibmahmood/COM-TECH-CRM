-- Insert sample students
INSERT INTO students (student_name, roll_number, class, course, joining_date, parent_phone, parent_email, address) VALUES
('Muhammad Ali', '01', '9th', 'Computer Science Fundamentals', '2024-03-22', '03074065110', 'ali.parent@email.com', 'Lahore, Pakistan'),
('Fatima Khan', '02', '10th', 'Advanced Computer Science', '2024-01-15', '03001234567', 'fatima.parent@email.com', 'Karachi, Pakistan'),
('Ahmed Hassan', '03', '11th', 'Programming & Web Development', '2023-09-10', '03219876543', 'ahmed.parent@email.com', 'Islamabad, Pakistan'),
('Ayesha Malik', '04', '12th', 'Software Engineering', '2023-08-05', '03334567890', 'ayesha.parent@email.com', 'Faisalabad, Pakistan'),
('Omar Siddique', '05', '9th', 'Computer Science Fundamentals', '2024-02-28', '03451234567', 'omar.parent@email.com', 'Rawalpindi, Pakistan')
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample fee receipts
INSERT INTO fee_receipts (student_id, payment_date, payment_method, total_fee, paid_amount, remaining_due, description, notes)
SELECT 
  s.id,
  '2025-09-07'::DATE,
  'Cash',
  c.fee_amount,
  c.fee_amount * 0.9, -- 90% paid
  c.fee_amount * 0.1, -- 10% remaining
  'Course Fee',
  'Partial payment received'
FROM students s
JOIN classes c ON s.class = c.class_name
WHERE s.roll_number IN ('01', '02', '03')
ON CONFLICT DO NOTHING;

-- Insert full payment for some students
INSERT INTO fee_receipts (student_id, payment_date, payment_method, total_fee, paid_amount, remaining_due, description, notes)
SELECT 
  s.id,
  '2025-08-15'::DATE,
  'Bank Transfer',
  c.fee_amount,
  c.fee_amount, -- Full payment
  0, -- No remaining due
  'Course Fee',
  'Full payment received'
FROM students s
JOIN classes c ON s.class = c.class_name
WHERE s.roll_number IN ('04', '05')
ON CONFLICT DO NOTHING;
