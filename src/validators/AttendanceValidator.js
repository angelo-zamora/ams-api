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
            throw new Error("ALREADY_CLOCKED_IN_TODAY");
        }
    }

    validateTodayAttendance(attendance) {

        if (!attendance) {

            throw new Error("NO_CLOCK_IN_FOUND");
        }
    }
}

module.exports = new AttendanceValidator();