/**
 * Dependency Injection Bootstrap Container
 *
 * Centralizes instantiation of database providers, repositories, and services.
 * Instances are created once at module load time and reused across Azure Function
 * invocations (leveraging the warm execution environment).
 *
 * To switch database providers or repositories, update this file only.
 */

const PostgresProvider = require('../database/PostgresProvider');
const PostgresAttendanceRepository = require('../repositories/PostgresAttendanceRepository');
const PostgresEmployeeRepository = require('../repositories/PostgresEmployeeRepository');
const AttendanceService = require('../services/AttendanceService');
const EmployeeService = require('../services/EmployeeService');

// --- Database Provider ---
const dbProvider = new PostgresProvider();

// --- Repositories ---
const attendanceRepository = new PostgresAttendanceRepository(dbProvider);
const employeeRepository = new PostgresEmployeeRepository(dbProvider);

// --- Services ---
const attendanceService = new AttendanceService(attendanceRepository);
const employeeService = new EmployeeService(employeeRepository);

module.exports = {
    attendanceService,
    employeeService,
};
