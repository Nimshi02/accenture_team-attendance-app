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

UPDATE employees e
SET
  phone_number = x.phone_number,
  date_of_birth = x.date_of_birth::DATE,
  address = x.address,
  department = x.department,
  designation = x.designation,
  date_of_joining = x.date_of_joining::DATE
FROM (
  VALUES
  ('alex.turner@company.com', '+61 98765 43210', '1989-03-14', '123 Green Street, Bangalore, Karnataka - 560001', 'Product Team', 'Team Manager', '2021-01-04'),
  ('emma.wright@company.com', '+61 98765 43211', '1991-06-22', '45 Lake View Road, Melbourne, VIC - 3000', 'Product Team', 'Team Lead', '2021-03-15'),
  ('daniel.brooks@company.com', '+61 98765 43212', '1988-11-02', '18 Park Avenue, Sydney, NSW - 2000', 'Engineering', 'Team Lead', '2020-08-10'),
  ('mark.evans@company.com', '+61 98765 43213', '1984-02-19', '7 King Street, Brisbane, QLD - 4000', 'Operations', 'Admin Manager', '2019-04-01'),
  ('priya.shah@company.com', '+61 98765 43214', '1995-05-14', '123 Green Street, Bangalore, Karnataka - 560001', 'Product Team', 'Software Engineer', '2024-01-01'),
  ('ben.collins@company.com', '+61 98765 43215', '1997-09-08', '28 Collins Street, Melbourne, VIC - 3000', 'Product Team', 'Support Analyst', '2024-02-12'),
  ('lucas.nguyen@company.com', '+61 98765 43216', '1993-01-27', '3 Harbour Road, Sydney, NSW - 2000', 'Product Team', 'Software Engineer', '2022-07-18'),
  ('james.wilson@company.com', '+61 98765 43217', '1990-12-05', '19 Queen Street, Brisbane, QLD - 4000', 'Product Team', 'QA Engineer', '2021-10-04'),
  ('chloe.martin@company.com', '+61 98765 43218', '1994-04-17', '92 High Street, Adelaide, SA - 5000', 'Design', 'UX Designer', '2023-05-22'),
  ('sarah.oneill@company.com', '+61 98765 43219', '1998-08-30', '14 North Terrace, Adelaide, SA - 5000', 'Design', 'Content Designer', '2024-03-04'),
  ('olivia.chen@company.com', '+61 98765 43220', '1996-07-11', '66 Swanston Street, Melbourne, VIC - 3000', 'Design', 'Product Designer', '2023-09-11'),
  ('sophie.laurent@company.com', '+61 98765 43221', '1992-10-26', '51 George Street, Sydney, NSW - 2000', 'Design', 'Researcher', '2022-02-07'),
  ('ahmed.hassan@company.com', '+61 98765 43222', '1987-03-03', '20 William Street, Perth, WA - 6000', 'Engineering', 'Backend Engineer', '2020-11-16'),
  ('tom.riley@company.com', '+61 98765 43223', '1991-12-21', '9 Elizabeth Street, Hobart, TAS - 7000', 'Engineering', 'DevOps Engineer', '2021-06-28'),
  ('nina.patel@company.com', '+61 98765 43224', '1995-01-12', '31 Murray Street, Perth, WA - 6000', 'Engineering', 'Frontend Engineer', '2023-01-09'),
  ('ryan.murphy@company.com', '+61 98765 43225', '1990-05-06', '17 Flinders Lane, Melbourne, VIC - 3000', 'Engineering', 'QA Analyst', '2021-09-20'),
  ('hannah.scott@company.com', '+61 98765 43226', '1999-02-28', '70 Crown Street, Wollongong, NSW - 2500', 'Operations', 'Coordinator', '2024-04-15'),
  ('aisha.khan@company.com', '+61 98765 43227', '1996-06-18', '5 Station Road, Geelong, VIC - 3220', 'Product Team', 'Business Analyst', '2023-08-14'),
  ('chris.walker@company.com', '+61 98765 43228', '1989-09-24', '84 Bridge Road, Richmond, VIC - 3121', 'Design', 'UX Engineer', '2022-05-30'),
  ('lucy.bennett@company.com', '+61 98765 43229', '1993-11-15', '12 Eagle Street, Brisbane, QLD - 4000', 'Engineering', 'Data Analyst', '2022-12-05')
) AS x(email, phone_number, date_of_birth, address, department, designation, date_of_joining)
WHERE e.email = x.email;


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


-- 4. Demo user accounts
-- All demo accounts use the password: Password123!
INSERT INTO user_accounts (employee_id, email, password_hash, role)
SELECT e.employee_id, x.email, x.password_hash, x.role
FROM (
  VALUES
  ('mark.evans@company.com', 'scrypt$32927b31688aa25199c5684f7dc66df7$6e72360b1bebc821572326a7f691fa2b50d5a2be8cbebb6f659cdd86add25272c54a3d12f948973b7dae56c3c197cb2e5798e14542d332d94d5afbb7e2e78fa2', 'admin'),
  ('alex.turner@company.com', 'scrypt$cc0596b3015fc3db9c1bddde29cb0a7b$3e8f82257958490d305bc3008c1ac21bb7a2e61b7168b255d86c8fc483fd8c81595737d96c97eeb9c5725e6fa30173b3859a9396a35f3854e72c3629d6d35e0c', 'manager'),
  ('priya.shah@company.com', 'scrypt$36a2f0f49702caee36159b5df60e418b$08671f37643a7097cb8b953f17f6330edfb637b1e5c1550741ba1ddeac2d93e1e4e6643264ac1f5f8d35bd01e0ea71bb7b852e79b946abb637afd0828eaf1a02', 'employee')
) AS x(email, password_hash, role)
JOIN employees e ON e.email = x.email
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = TRUE;


-- 5. Default schedule
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


-- 6. Sample attendance records
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


-- 7. Sample location requests
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


-- 8. Sample audit records
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


-- 9. Sample notifications
INSERT INTO notifications (
  employee_id,
  category,
  type,
  title,
  message,
  is_read,
  created_at
)
SELECT
  e.employee_id,
  x.category,
  x.type,
  x.title,
  x.message,
  x.is_read,
  x.created_at::TIMESTAMP
FROM (
  VALUES
  ('priya.shah@company.com', 'requests', 'info', 'Your submitted location request for 16 May is approved', 'Your manager approved the location change request.', FALSE, '2026-05-29 10:30:00'),
  ('priya.shah@company.com', 'general', 'success', 'Your work location for 12 May has been recorded successfully', 'Attendance and work location details were saved.', FALSE, '2026-05-28 09:00:00'),
  ('priya.shah@company.com', 'general', 'info', 'Reminder: Please submit your work location for tomorrow', 'Your schedule is missing tomorrow''s work location.', TRUE, '2026-05-27 15:10:00'),
  ('priya.shah@company.com', 'requests', 'warning', 'Team meeting scheduled on 15 May at 9:00 AM', 'Please attend from your planned location.', TRUE, '2026-05-27 08:40:00'),
  ('priya.shah@company.com', 'system', 'system', 'System maintenance scheduled on 25 May from 9:00 PM to 10:00 AM', 'Attendance services may be briefly unavailable.', TRUE, '2026-05-26 14:00:00'),

  ('alex.turner@company.com', 'requests', 'info', 'Priya Shah submitted a new work location request', 'Review the request before the next schedule update.', FALSE, '2026-05-29 11:15:00'),
  ('alex.turner@company.com', 'general', 'warning', 'Two team members have pending location updates', 'Check team attendance before end of day.', FALSE, '2026-05-29 09:45:00'),
  ('alex.turner@company.com', 'system', 'system', 'Weekly report is ready to view', 'Your team attendance report has been generated.', TRUE, '2026-05-28 16:00:00'),

  ('mark.evans@company.com', 'system', 'system', 'System health report generated', 'The platform report is available for review.', FALSE, '2026-05-29 08:30:00'),
  ('mark.evans@company.com', 'general', 'info', 'Attendance audit completed', 'Daily audit completed with no critical issues.', TRUE, '2026-05-28 17:20:00')
) AS x(email, category, type, title, message, is_read, created_at)
JOIN employees e ON e.email = x.email
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications n
  WHERE n.employee_id = e.employee_id
    AND n.title = x.title
    AND n.created_at = x.created_at::TIMESTAMP
);
