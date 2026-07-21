const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");
const dateHelper = require("../helpers/DateHelper");

/**
 * ============================================
 * Overtime Response DTO
 * 外勤レスポンス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeResponse {

    constructor(overtime = null, locale) {

        this.success = true;

        this.message = localeHelper.translate("OVERTIME_COMPLETED", locale);

        if (overtime == null) return;

        this.overtime = {
            userNo: overtime.userNo,
            reqDate: dateHelper.formatDate(overtime.reqDate),
            startTime: overtime.startHour + ":" + overtime.startMin,
            endTime: overtime.endHour + ":" + overtime.endMin,
            reason: overtime.reason
        }

    }

}

module.exports = OvertimeResponse;