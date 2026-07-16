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

    validateClockIn(attendance, locale) {

        if (attendance) {
            throw new Error(localeHelper.translate("ALREADY_CLOCKED_IN", locale));
        }
    }

    validateClockOut(attendance, locale) {

        if (!attendance) {

            throw new Error(localeHelper.translate("CLOCK_IN_RECORD_NOT_FOUND", locale));
        }

        if (attendance.clock_out) {

            throw new Error(localeHelper.translate("ALREADY_CLOCKED_OUT", locale));
        }
    }
}

module.exports = new AttendanceValidator();