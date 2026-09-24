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
 * �жд��������ӥ�
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
     * ���Ȱ��λĶȿ�����������롣
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

    async getMonthlyAttendance(session, params, locale) {
        const email = session.currentUser.email;
        const employee = await employeeService.validateEmployee(email, locale);

        validator.validateMonthlyAttendanceRequest(params);

        const targetAccountId = params?.accountId
            ? params.accountId
            : employee.USERNO;

        const monthlyData = await attendanceApiService.getMonthlyAttendance(
            employee,
            targetAccountId,
            params.year,
            params.month
        );

        if (!monthlyData || !monthlyData.accounts) {
            throw new Error("NO_MONTHLY_ATTENDANCE_FOUND");
        }

        return monthlyData;
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

    /**
     * Get attendance edit history
     * @param {Object} session - The session object containing user information
     * @param {Object} params - Parameters containing userNo and date (YYYYMMDD)
     * @param {string} locale - The locale for response messages
     * @returns {Promise<Array>} - Array of edit history records with date field
     */
    async getEditHistory(session, params, locale) {
        const email = session.currentUser.email;
        const employee = await employeeService.validateEmployee(email, locale);

        const { userNo, date } = params;

        const rows = await attendanceRepository.getEditHistory(userNo, date);

        if (!rows || rows.length === 0) {
            return null;
        }

        // Process all records
        return rows.map(row => {
            // Format clockin and clockout times
            const clockin = row.STARTHOUR && row.STARTMIN 
                ? `${String(row.STARTHOUR).padStart(2, '0')}:${String(row.STARTMIN).padStart(2, '0')}`
                : null;

            const clockout = row.ENDHOUR && row.ENDMIN 
                ? `${String(row.ENDHOUR).padStart(2, '0')}:${String(row.ENDMIN).padStart(2, '0')}`
                : null;

            // Parse UDTDATE (YYYYMMDDHHMMSS format) to get HH:MM for updateTime
            let updateTime = null;
            if (row.UDTDATE && row.UDTDATE.length >= 14) {
                const hour = row.UDTDATE.substring(8, 10);
                const minute = row.UDTDATE.substring(10, 12);
                updateTime = `${hour}:${minute}`;
            }

            // Extract YYYYMMDD part of UDTDATE
            let udtDate = null;
            if (row.UDTDATE && row.UDTDATE.length >= 8) {
                udtDate = row.UDTDATE.substring(0, 8);
            }

            return {
                id: row.NO,
                date: row.DATE_,
                userno: row.USERNO,
                clockin,
                clockout,
                reason: row.REASON,
                updatedBy: row.UDTUSERNAME,
                status: row.STATUS,
                updateTime,
                udtDate
            };
        });
    }
    async getFlex(session, params, locale) {
        const sessionEmail = session.currentUser.email;
        const employee = await employeeService.validateEmployee(sessionEmail, locale);

        const targetUserNo = params?.userNo ? params.userNo : employee.USERNO;
        const targetEmail = params?.email ? params.email : sessionEmail;

        const flexData = await attendanceApiService.getFlex(
            employee,
            targetUserNo,
            targetEmail,
            params.workMonth,
            params.workYear
        );

        if (!flexData) {
            throw new Error("NO_FLEX_FOUND");
        }

        return flexData;
    }

    async sendTime(session, payload, locale) {
        const sessionEmail = session.currentUser.email;
        const employee = await employeeService.validateEmployee(sessionEmail, locale);

        // If userNo is not provided in payload, default to logged-in user's USERNO
        const targetUserNo = payload?.userNo ? payload.userNo : employee.USERNO;

        const editData = await attendanceApiService.sendTime(
            employee,
            targetUserNo,
            payload
        );

        if (!editData) {
            throw new Error("EDIT_TIME_FAILED");
        }

        return editData;
    }

    /**
     * Edit or send Leave request with optional userNo
     */
    async editLeave(session, payload, locale) {
        const sessionEmail = session.currentUser.email;
        const employee = await employeeService.validateEmployee(sessionEmail, locale);

        // If userNo is not provided in payload, default to logged-in user's USERNO
        const targetUserNo = payload?.userNo ? payload.userNo : employee.USERNO;

        const editData = await attendanceApiService.editLeave(
            employee,
            targetUserNo,
            payload
        );

        if (!editData) {
            throw new Error("EDIT_LEAVE_FAILED");
        }

        return editData;
    }
}

module.exports = new AttendanceService();
