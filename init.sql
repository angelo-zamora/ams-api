-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    office VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('check-in', 'check-out')),
    location VARCHAR(255) DEFAULT 'Not Specified',
    notes TEXT DEFAULT ''
);

-- Seed employees table
INSERT INTO employees (id, employee_id, first_name, last_name, department, role, status, office, email)
VALUES
('1', '1001', 'Jane', 'Doe', 'Engineering', 'Software Engineer', 'active', 'Tokyo', 'jane.doe@example.com'),
('2', '1002', 'John', 'Smith', 'HR', 'HR Manager', 'active', 'Seattle', 'john.smith@example.com'),
('3', '1003', 'Satoshi', 'Tanaka', 'Engineering', 'Lead Architect', 'active', 'Tokyo', 'satoshi.tanaka@example.com'),
('4', '1004', 'Emily', 'Davis', 'Sales', 'Account Executive', 'active', 'London', 'emily.davis@example.com'),
('5', '1005', 'Michael', 'Wilson', 'Engineering', 'QA Engineer', 'active', 'Remote', 'michael.wilson@example.com')
ON CONFLICT (id) DO NOTHING;
