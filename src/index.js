const { app } = require('@azure/functions');
const attendanceApiService = require('./services/AttendanceApiService');
const employeeRepository = require('./repositories/EmployeeRepository');
const logger = require('./helpers/Logger');

require("./functions/ClockIn");
require("./functions/ClockOut");
require("./functions/Attendance");
require("./functions/ClockOutReminder");

app.setup({
    enableHttpStream: true,
});

const bootstrapAttendanceApi = async () => {
    try {
        const employee = await employeeRepository.findFirstEmployee();
        if (employee) {
            await attendanceApiService.initializeOnStartup(employee);
        }
    } catch (error) {
        logger.error(error);
    }
};

bootstrapAttendanceApi();
