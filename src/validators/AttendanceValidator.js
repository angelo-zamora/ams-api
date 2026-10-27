const localeHelper = require("../helpers/LocaleHelper");

/**
 * ============================================
 * Attendance Validator
 * �жд����Х�ǡ�����
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AttendanceValidator {

    validateClockIn(attendance) {

        if (attendance) {
            if (attendance.startHour != null && attendance.startMin != null) {
                throw new Error("ALREADY_CLOCKED_IN_TODAY");
            }
        }
    }

    validateClockOut(attendance) {

        this.validateTodayAttendance(attendance);

        if (attendance) {
            if (attendance.endHour != null && attendance.endMin != null) {
                throw new Error("ALREADY_CLOCKED_OUT");
            }
        }
    }

    validateTodayAttendance(attendance) {
        if (!attendance) {
            throw new Error("NO_CLOCK_IN_FOUND");
        }
    }

    validateMonthlyAttendanceRequest(params) {
        if (!params?.year || !params?.month) {
            throw new Error("YEAR_AND_MONTH_REQUIRED");
        }

        if (!/^\d{4}$/.test(String(params.year))) {
            throw new Error("INVALID_YEAR_FORMAT");
        }

        if (!/^\d{2}$/.test(String(params.month))) {
            throw new Error("INVALID_MONTH_FORMAT");
        }
    }
}

module.exports = new AttendanceValidator();