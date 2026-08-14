const attendanceRepository = require("../repositories/AttendanceRepository");
const employeeService = require("./EmployeeService");
const localeHelper = require("../helpers/LocaleHelper");
const dateHelper = require("../helpers/DateHelper");
const constants = require("../helpers/Constants");
const attendanceApiService = require("./AttendanceApiService");
const validator = require("../validators/AttendanceValidator");
const leaveValidator = require("../validators/LeaveValidator");

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

        attendanceApiService.clockIn(employee);

        return employee;
    }

    /**
     * Clock Out
     */
    async clockOut(session, locale) {

        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        const attendance =
            await attendanceRepository.getTodayAttendance(employee.USERNO);

        console.log(attendance);

        validator.validateClockOut(attendance);

        attendanceApiService.clockOut(employee);

        return attendance;
    }

    /**
     * Get Attendance Today
     */
    async getAttendanceToday(session, locale) {
        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        const attendance = await attendanceRepository.getTodayAttendance(employee.USERNO);

        validator.validateTodayAttendance(attendance);

        const lateClockin = this.isLateClockIn(
            attendance.startHour,
            attendance.startMin
        )
            ? constants.WARNING.LATE_CLOCK_IN
            : null;

        attendance.lateClockIn = lateClockin;

        return attendance;
    }

    /**
     * Leave Request
     */
    async leaveRequest(payload, session, locale) {

        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        leaveValidator.validateRequest(payload.params);

        await attendanceApiService.leave(employee, payload.params);

        return null;
    }

    /**
     * Get employee overtime request
     * 従業員の残業申請を取得する。
     */
    async getLeaveRequest(session, request, locale) {
        const email = session.currentUser.email;
        
        const employee = await employeeService.validateEmployee(email, locale);

        const leave = await attendanceRepository.getLeave(employee.USERNO, request.params.date_);

        leaveValidator.validateLeave(leave);

        return leave;
    }

    async getLeaveRequestByDate(session, date, locale) {
        const email = session.currentUser.email;
        
        const employee = await employeeService.validateEmployee(email, locale);

        const leave = await attendanceRepository.getLeaveRequest(employee.USERNO, date);
        
        leaveValidator.validateGetLeaveRequest(leave);

        return leave;
    }

    /**
     * Is late clock in
     */
    isLateClockIn(hour, minute) {
        hour = Number(hour);
        minute = Number(minute);

        return hour > constants.LATE_CLOCK_IN.HOUR ||
            (hour === constants.LATE_CLOCK_IN.HOUR &&
                minute >= constants.LATE_CLOCK_IN.MINUTE);
    }
}

module.exports = new AttendanceService();
