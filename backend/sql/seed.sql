-- 1. Work locations
INSERT INTO work_locations (location_name)
VALUES
('Office'),
('Home'),
('Client Site')
ON CONFLICT (location_name) DO NOTHING;


-- 2. Employees
INSERT INTO employees (full_name, email, employment_type)
VALUES
('Alex Turner', 'alex.turner@company.com', 'FT'),
('Emma Wright', 'emma.wright@company.com', 'FT'),
('Daniel Brooks', 'daniel.brooks@company.com', 'FT'),
('Mark Evans', 'mark.evans@company.com', 'FT'),
('Priya Shah', 'priya.shah@company.com', 'FT'),
('Ben Collins', 'ben.collins@company.com', 'PT'),
('Lucas Nguyen', 'lucas.nguyen@company.com', 'FT'),
('James Wilson', 'james.wilson@company.com', 'FT'),
('Chloe Martin', 'chloe.martin@company.com', 'FT'),
('Sarah O''Neill', 'sarah.oneill@company.com', 'PT'),
('Olivia Chen', 'olivia.chen@company.com', 'PT'),
('Sophie Laurent', 'sophie.laurent@company.com', 'FT'),
('Ahmed Hassan', 'ahmed.hassan@company.com', 'FT'),
('Tom Riley', 'tom.riley@company.com', 'FT'),
('Nina Patel', 'nina.patel@company.com', 'FT'),
('Ryan Murphy', 'ryan.murphy@company.com', 'FT'),
('Hannah Scott', 'hannah.scott@company.com', 'PT'),
('Aisha Khan', 'aisha.khan@company.com', 'PT'),
('Chris Walker', 'chris.walker@company.com', 'FT'),
('Lucy Bennett', 'lucy.bennett@company.com', 'FT')
ON CONFLICT (email) DO NOTHING;


-- 3. Manager relationships
UPDATE employees e
SET manager_id = m.employee_id
FROM employees m
WHERE
(e.email = 'alex.turner@company.com' AND m.email = 'mark.evans@company.com') OR
(e.email = 'emma.wright@company.com' AND m.email = 'mark.evans@company.com') OR
(e.email = 'daniel.brooks@company.com' AND m.email = 'mark.evans@company.com') OR
(e.email = 'mark.evans@company.com' AND m.email = 'mark.evans@company.com') OR
(e.email = 'priya.shah@company.com' AND m.email = 'alex.turner@company.com') OR
(e.email = 'ben.collins@company.com' AND m.email = 'alex.turner@company.com') OR
(e.email = 'lucas.nguyen@company.com' AND m.email = 'alex.turner@company.com') OR
(e.email = 'james.wilson@company.com' AND m.email = 'alex.turner@company.com') OR
(e.email = 'chloe.martin@company.com' AND m.email = 'emma.wright@company.com') OR
(e.email = 'sarah.oneill@company.com' AND m.email = 'emma.wright@company.com') OR
(e.email = 'olivia.chen@company.com' AND m.email = 'emma.wright@company.com') OR
(e.email = 'sophie.laurent@company.com' AND m.email = 'emma.wright@company.com') OR
(e.email = 'ahmed.hassan@company.com' AND m.email = 'daniel.brooks@company.com') OR
(e.email = 'tom.riley@company.com' AND m.email = 'daniel.brooks@company.com') OR
(e.email = 'nina.patel@company.com' AND m.email = 'daniel.brooks@company.com') OR
(e.email = 'ryan.murphy@company.com' AND m.email = 'daniel.brooks@company.com') OR
(e.email = 'hannah.scott@company.com' AND m.email = 'mark.evans@company.com') OR
(e.email = 'aisha.khan@company.com' AND m.email = 'alex.turner@company.com') OR
(e.email = 'chris.walker@company.com' AND m.email = 'emma.wright@company.com') OR
(e.email = 'lucy.bennett@company.com' AND m.email = 'daniel.brooks@company.com');


-- 4. Default schedule
INSERT INTO employee_default_schedule (employee_id, day_of_week, location_id)
SELECT e.employee_id, x.day_of_week, wl.location_id
FROM (
  VALUES
  ('alex.turner@company.com', 'Monday', 'Home'),
  ('alex.turner@company.com', 'Tuesday', 'Client Site'),
  ('alex.turner@company.com', 'Thursday', 'Client Site'),

  ('emma.wright@company.com', 'Friday', 'Home'),
  ('emma.wright@company.com', 'Tuesday', 'Client Site'),

  ('daniel.brooks@company.com', 'Monday', 'Home'),

  ('mark.evans@company.com', 'Monday', 'Home'),

  ('priya.shah@company.com', 'Friday', 'Home'),
  ('priya.shah@company.com', 'Wednesday', 'Client Site'),

  ('ben.collins@company.com', 'Monday', 'Home'),

  ('lucas.nguyen@company.com', 'Monday', 'Home'),
  ('lucas.nguyen@company.com', 'Wednesday', 'Client Site'),

  ('james.wilson@company.com', 'Monday', 'Home'),
  ('james.wilson@company.com', 'Tuesday', 'Client Site'),

  ('chloe.martin@company.com', 'Friday', 'Home'),
  ('chloe.martin@company.com', 'Tuesday', 'Client Site'),
  ('chloe.martin@company.com', 'Wednesday', 'Client Site'),

  ('sarah.oneill@company.com', 'Friday', 'Home'),
  ('sarah.oneill@company.com', 'Thursday', 'Client Site'),

  ('olivia.chen@company.com', 'Friday', 'Home'),

  ('sophie.laurent@company.com', 'Friday', 'Home'),
  ('sophie.laurent@company.com', 'Tuesday', 'Client Site'),
  ('sophie.laurent@company.com', 'Thursday', 'Client Site'),

  ('ahmed.hassan@company.com', 'Monday', 'Home'),
  ('ahmed.hassan@company.com', 'Thursday', 'Client Site'),

  ('tom.riley@company.com', 'Monday', 'Home'),
  ('tom.riley@company.com', 'Monday', 'Client Site'),

  ('nina.patel@company.com', 'Friday', 'Home'),
  ('nina.patel@company.com', 'Wednesday', 'Client Site'),
  ('nina.patel@company.com', 'Thursday', 'Client Site'),

  ('ryan.murphy@company.com', 'Monday', 'Home'),
  ('ryan.murphy@company.com', 'Wednesday', 'Client Site'),

  ('hannah.scott@company.com', 'Friday', 'Home'),
  ('hannah.scott@company.com', 'Monday', 'Client Site'),

  ('aisha.khan@company.com', 'Friday', 'Home'),
  ('aisha.khan@company.com', 'Thursday', 'Client Site'),

  ('chris.walker@company.com', 'Monday', 'Home'),
  ('chris.walker@company.com', 'Wednesday', 'Client Site'),

  ('lucy.bennett@company.com', 'Friday', 'Home')
) AS x(email, day_of_week, location_name)
JOIN employees e ON e.email = x.email
JOIN work_locations wl ON wl.location_name = x.location_name
ON CONFLICT (employee_id, day_of_week) DO NOTHING;


-- 5. Sample attendance records
INSERT INTO attendance_records (
  employee_id,
  attendance_date,
  planned_location_id,
  actual_location_id,
  status
)
SELECT
  e.employee_id,
  x.attendance_date::DATE,
  planned.location_id,
  actual.location_id,
  x.status
FROM (
  VALUES
  ('alex.turner@company.com', '2026-05-25', 'Home', 'Home', 'Present'),
  ('emma.wright@company.com', '2026-05-25', 'Office', 'Office', 'Present'),
  ('daniel.brooks@company.com', '2026-05-25', 'Home', 'Home', 'Present'),
  ('mark.evans@company.com', '2026-05-25', 'Home', 'Office', 'Present'),
  ('priya.shah@company.com', '2026-05-25', 'Office', 'Office', 'Present'),
  ('ben.collins@company.com', '2026-05-25', 'Home', 'Home', 'Present'),
  ('lucas.nguyen@company.com', '2026-05-25', 'Home', 'Home', 'Present'),
  ('james.wilson@company.com', '2026-05-25', 'Home', 'Home', 'Present'),
  ('chloe.martin@company.com', '2026-05-25', 'Office', 'Office', 'Present'),
  ('sarah.oneill@company.com', '2026-05-25', 'Office', 'Office', 'Absent')
) AS x(email, attendance_date, planned_location, actual_location, status)
JOIN employees e ON e.email = x.email
JOIN work_locations planned ON planned.location_name = x.planned_location
JOIN work_locations actual ON actual.location_name = x.actual_location
ON CONFLICT (employee_id, attendance_date) DO NOTHING;


-- 6. Sample location requests
INSERT INTO location_requests (
  employee_id,
  request_date,
  requested_location_id,
  reason,
  status,
  approved_by
)
SELECT
  e.employee_id,
  x.request_date::DATE,
  wl.location_id,
  x.reason,
  x.status,
  approver.employee_id
FROM (
  VALUES
  ('priya.shah@company.com', '2026-05-26', 'Home', 'Requesting to work from home for personal appointment.', 'Pending', 'alex.turner@company.com'),
  ('chloe.martin@company.com', '2026-05-27', 'Client Site', 'Client visit required for project discussion.', 'Approved', 'emma.wright@company.com'),
  ('ryan.murphy@company.com', '2026-05-28', 'Home', 'Requesting remote work due to transport issue.', 'Rejected', 'daniel.brooks@company.com')
) AS x(email, request_date, location_name, reason, status, approver_email)
JOIN employees e ON e.email = x.email
JOIN work_locations wl ON wl.location_name = x.location_name
JOIN employees approver ON approver.email = x.approver_email;


-- 7. Sample audit records
INSERT INTO audit_records (
  employee_id,
  audit_date,
  expected_location_id,
  is_present,
  checked_by
)
SELECT
  e.employee_id,
  x.audit_date::DATE,
  wl.location_id,
  x.is_present,
  auditor.employee_id
FROM (
  VALUES
  ('alex.turner@company.com', '2026-05-25', 'Home', TRUE, 'mark.evans@company.com'),
  ('emma.wright@company.com', '2026-05-25', 'Office', TRUE, 'mark.evans@company.com'),
  ('sarah.oneill@company.com', '2026-05-25', 'Office', FALSE, 'emma.wright@company.com')
) AS x(email, audit_date, expected_location, is_present, auditor_email)
JOIN employees e ON e.email = x.email
JOIN work_locations wl ON wl.location_name = x.expected_location
JOIN employees auditor ON auditor.email = x.auditor_email;