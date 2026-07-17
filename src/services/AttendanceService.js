const attendanceRepository = require("../repositories/AttendanceRepository");
const employeeService = require("./EmployeeService");
const localeHelper = require("../helpers/LocaleHelper");
const dateHelper = require("../helpers/DateHelper");
const constants = require("../helpers/Constants");
const attendanceApiService = require("./AttendanceApiService");
const validator = require("../validators/AttendanceValidator");

/**
 * ============================================
 * Attendance Service
 * 出勤管理サービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AttendanceService {

    /**
     * Clock In
     */
    async clockIn(session, locale) {

        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        const attendance =
            await attendanceRepository.getTodayAttendance(employee.USERNO);

        validator.validateClockIn(attendance);

        await attendanceApiService.clockIn(employee);
    }

    /**
     * Get Attendance Today
     */
    async getAttendanceToday(session, locale) {
        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        const attendance = await attendanceRepository.getTodayAttendance(employee.USERNO);

        validator.validateTodayAttendance(attendance);

        const lateClockin = this.lateClockIn(dateHelper.parseDateTime(attendance.date_, `${attendance.startHour}:${attendance.startMin}`)) 
                    ? constants.WARNING.LATE_CLOCK_IN : null;

        attendance.lateClockin = lateClockin;

        return attendance;
    }

    /**
     * Late Clock In
     */
    lateClockIn(clockInTime) {

        return clockInTime.getHours() > constants.LATE_CLOCK_IN.HOUR ||
            (clockInTime.getHours() === constants.LATE_CLOCK_IN.HOUR &&
            clockInTime.getMinutes() >= constants.LATE_CLOCK_IN.MINUTE);
    }
}

module.exports = new AttendanceService();
