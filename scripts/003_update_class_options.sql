-- Update classes table with Pakistani education system classes
INSERT INTO classes (class_name, course_name, fee_amount) VALUES
('KG', 'Kindergarten Program', 5000),
('Class 1', 'Primary Education - Grade 1', 6000),
('Class 2', 'Primary Education - Grade 2', 6000),
('Class 3', 'Primary Education - Grade 3', 6500),
('Class 4', 'Primary Education - Grade 4', 6500),
('Class 5', 'Primary Education - Grade 5', 7000),
('Class 6', 'Middle School - Grade 6', 7500),
('Class 7', 'Middle School - Grade 7', 7500),
('Class 8', 'Middle School - Grade 8', 8000),
('Class 9', 'Secondary School - Grade 9', 9000),
('Class 10', 'Secondary School - Grade 10 (Matric)', 10000),
('Class 11 (1st Year)', 'Higher Secondary - 1st Year (FSc/FA)', 12000),
('Class 12 (2nd Year)', 'Higher Secondary - 2nd Year (FSc/FA)', 12000)
ON CONFLICT (class_name) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  fee_amount = EXCLUDED.fee_amount;
