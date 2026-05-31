CREATE TABLE IF NOT EXISTS work_locations (
  location_id SERIAL PRIMARY KEY,
  location_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  employment_type VARCHAR(2) NOT NULL CHECK (employment_type IN ('FT', 'PT')),
  manager_id INTEGER REFERENCES employees(employee_id)
);

CREATE TABLE IF NOT EXISTS user_accounts (
  user_id SERIAL PRIMARY KEY,
  employee_id INTEGER UNIQUE NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_default_schedule (
  schedule_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (
    day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
  ),
  location_id INTEGER NOT NULL REFERENCES work_locations(location_id),
  UNIQUE (employee_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  attendance_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  planned_location_id INTEGER NOT NULL REFERENCES work_locations(location_id),
  actual_location_id INTEGER NOT NULL REFERENCES work_locations(location_id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent')),
  UNIQUE (employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS location_requests (
  request_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  requested_location_id INTEGER NOT NULL REFERENCES work_locations(location_id),
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Approved', 'Rejected')
  ),
  approved_by INTEGER REFERENCES employees(employee_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_records (
  audit_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  audit_date DATE NOT NULL,
  expected_location_id INTEGER NOT NULL REFERENCES work_locations(location_id),
  is_present BOOLEAN NOT NULL,
  checked_by INTEGER NOT NULL REFERENCES employees(employee_id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
