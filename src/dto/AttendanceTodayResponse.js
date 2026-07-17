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

    constructor(employee, locale) {

        this.success = true;

        this.code = employee.lateClockin ?? constants.STATUS.SUCCESS;

        this.employee = {
            userNo: employee.userNo,
            clockin: dateHelper.datetime(
                dateHelper.parseDateTime(
                    employee.date_, `${employee.startHour}:${employee.startMin}`)
            ),
            clockout: employee.endHour ?dateHelper.datetime(
                dateHelper.parseDateTime(
                    employee.date_, `${employee.endHour}:${employee.endMin}`)
            ) : null,
        };

    }

}

module.exports = AttendanceTodayResponse;