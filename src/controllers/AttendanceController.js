const attendanceService = require("../services/AttendanceService");
const ClockInResponse = require("../dto/ClockInResponse");
const ClockOutResponse = require("../dto/ClockOutResponse");
const LeaveResponse = require("../dto/LeaveResponse");
const AttendanceTodayResponse = require("../dto/AttendanceTodayResponse");
const MonthlyAttendanceResponse = require("../dto/MonthlyAttendanceResponse");
const EditHistoryResponse = require("../dto/EditHistoryResponse");
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
     * Clock out an employee.
     * 従業員の出勤を記録する。
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<ClockOutResponse>} - The response containing employee information after clocking in.
     */
    async clockOut(session, locale) {
        const employee = await attendanceService.clockOut(session, locale);

        return new ClockOutResponse(employee, locale);
    }

    /**
     * Request leave for an employee.
     * 従業員の休暇を申請する。
     * @param {Object} payload - The payload to send to the API.
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<LeaveResponse>} - The response containing employee information after clocking in.
     */
    async leave(payload, session, locale) {
        await attendanceService.leaveRequest(payload, session, locale);

        return new LeaveResponse(null, locale);
    }

    /**
     * Get attendance information for the current day.
     * 今日の勤怠情報を取得する。
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<AttendanceTodayResponse>} - The response containing attendance information for the current day.
     */
    async getAttendanceToday(session , locale) {
        const attendance = await attendanceService.getAttendanceToday(session);

        return new AttendanceTodayResponse(attendance, locale);
    }

    async getLeaveRequestByDate(session, date, locale) {
        const leave = await attendanceService.getLeaveRequestByDate(session, date, locale);

        return new LeaveResponse(leave, locale);
    }

    async getMonthlyAttendance(session, params, locale) {
        const monthlyAttendance = await attendanceService.getMonthlyAttendance(
            session,
            params,
            locale
        );

        return new MonthlyAttendanceResponse(monthlyAttendance, locale);
    }
    async getEditHistory(session, params, locale) {
        const editHistory = await attendanceService.getEditHistory(session, params, locale);

        return new EditHistoryResponse(editHistory);
    }

    /**
     * Get flex attendance information.
     * フレックス勤怠情報を取得する。
     * @param {Object} session - The session object containing user information.
     * @param {Object} params - Query parameters (userNo, email, workMonth, workYear).
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<Object>} - The flex attendance response data.
     */
    async getFlex(session, params, locale) {
        const flexData = await attendanceService.getFlex(
            session,
            params,
            locale
        );

        return flexData;
    }

    /**
     * Send or edit attendance time.
     * 勤怠時間の編集・送信を行う。
     * @param {Object} session - The session object containing user information.
     * @param {Object} payload - The payload containing edit time parameters.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<Object>} - The response data from the edit time action.
     */
    async sendTime(session, payload, locale) {
        const result = await attendanceService.sendTime(
            session,
            payload,
            locale
        );

        return result;
    }
    
    /**
     * Edit or send leave request with optional userNo.
     * 休暇申請・編集を行う。
     * @param {Object} session - The session object containing user information.
     * @param {Object} payload - The payload containing leave edit parameters.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<Object>} - The response data from the leave action.
     */
    async editLeave(session, payload, locale) {
        const result = await attendanceService.editLeave(
            session,
            payload,
            locale
        );

        return result;
    }
}

module.exports = new AttendanceController();
