const attendanceService = require("../services/AttendanceService");
const ClockInResponse = require("../dto/ClockInResponse");
const ClockOutResponse = require("../dto/ClockOutResponse");
const AttendanceHistoryResponse = require("../dto/AttendanceHistory");
const constants = require("../helpers/Constants");

/**
 * ============================================
 * Attendance Controller
 * 出勤管理担当者
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AttendanceController {

    async clockIn(session, locale) {
        const employee = await attendanceService.clockIn(session, locale);

        const lateClockin = attendanceService.lateClockIn(new Date(employee.CLOCK_IN)) 
            ? constants.WARNING.LATE_CLOCK_IN : null

        return new ClockInResponse(employee, locale , lateClockin);
    }

    async clockOut(session, locale) {
        const employee = await attendanceService.clockOut(session, locale);

        return new ClockOutResponse(employee, locale);
    }

    async history(session) {
        const history = await attendanceService.history(session);

        return new AttendanceHistoryResponse(history);
    }

}

module.exports = new AttendanceController();
