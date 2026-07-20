const localeHelper = require("../helpers/LocaleHelper");

/**
 * ============================================
 * Attendance Validator
 * 出勤管理バリデーター
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
}

module.exports = new AttendanceValidator();