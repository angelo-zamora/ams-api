const attendanceService = require("../services/AttendanceService");
const ClockInResponse = require("../dto/ClockInResponse");
const AttendanceTodayResponse = require("../dto/AttendanceTodayResponse");
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

    /**
     * Clock in an employee.
     * 従業員の出勤を記録する。
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<ClockInResponse>} - The response containing employee information after clocking in.
     */
    async clockIn(session, locale) {
        const employee = await attendanceService.clockIn(session, locale);

        return new ClockInResponse(employee, locale);
    }

    /**
     * Get attendance information for the current day.
     * 今日の勤怠情報を取得する。
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<AttendanceTodayResponse>} - The response containing attendance information for the current day.
     */
    async getAttendanceToday(session , locale) {
        const employee = await attendanceService.getAttendanceToday(session);

        return new AttendanceTodayResponse(employee, locale);
    }
}

module.exports = new AttendanceController();
