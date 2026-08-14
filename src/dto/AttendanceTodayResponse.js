const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");
const dateHelper = require("../helpers/DateHelper");

/**
 * ============================================
 * Clock In Response DTO
 * 出勤レスポンス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AttendanceTodayResponse {

    constructor(attendance, locale) {
        this.code = attendance['lateClockIn'] ?? constants.STATUS.SUCCESS;

        this.attendance = {
            userNo: attendance.userNo,
            clockin: attendance.startHour ? dateHelper.formatDbDateTime(
                attendance.date_,
                attendance.startHour,
                attendance.startMin
            ) : null,
            clockout: attendance.endHour ? dateHelper.formatDbDateTime(
                attendance.date_,
                attendance.endHour,
                attendance.endMin
            ) : null,
        };

    }

}

module.exports = AttendanceTodayResponse;