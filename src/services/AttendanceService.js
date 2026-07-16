const attendanceRepository = require("../repositories/mysql/AttendanceRepository");
const employeeService = require("./EmployeeService");
const mailService = require("./MailService");
const localeHelper = require("../helpers/LocaleHelper");
const dateHelper = require("../helpers/DateHelper");
const constants = require("../helpers/Constants");

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

        if (attendance) {
            throw new Error(localeHelper.translate("ALREADY_CLOCKED_IN_TODAY", locale));
        }

        const now = dateHelper.now();

        if (this.lateClockIn(now)) {
        }

        await mailService.sendClockIn(
            session.accessToken,
            employee,
            now
        );

        return Object.assign(employee, {
            CLOCK_IN: dateHelper.datetime(now),

        });
    }

    /**
     * Clock Out
     */
    async clockOut(session, locale) {

        const email = session.currentUser.email;

        const employee = await employeeService.validateEmployee(email, locale);

        const attendance =
            await attendanceRepository.getTodayAttendance(email);

        if (!attendance) {
            throw new Error(localeHelper.translate("NO_CLOCK_IN_FOUND", locale));
        }

        if (attendance.clock_out) {
            throw new Error(localeHelper.translate("ALREADY_CLOCKED_OUT", locale));
        }

        await attendanceRepository.clockOut(email);

        await mailService.sendClockOut(
            session.accessToken,
            employee

        );

        return employee;
    }

    /**
     * Attendance History
     */
    async history(session) {

        return await attendanceRepository.getHistory(
            session.currentUser.email
        );
    }

    /**
     * Late Clock In
     */
    lateClockIn(clockInTime) {

        return clockInTime.getHours() > constants.LATE_CLOCK_IN.HOUR ||
        (clockInTime.getHours() === constants.LATE_CLOCK_IN.HOUR && clockInTime.getMinutes() >= constants.LATE_CLOCK_IN.MINUTE);
    }
}

module.exports = new AttendanceService();
