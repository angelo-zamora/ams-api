const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");
const dateHelper = require("../helpers/DateHelper");

/**
 * ============================================
 * Leave Response DTO
 * 休暇レスポンス
 * Author: CRESS-INFO Angelo
 * Date: 2026/08/10
 * ============================================
 */
class LeaveResponse {

    constructor(leave = null, locale) {

        this.message = localeHelper.translate("LEAVE_COMPLETED", locale);
        
        this.code = constants.STATUS.LEAVE_REQUEST_SUCCESS;

        if (leave == null) return;

        this.leave = {
            userNo: leave.userNo,
            status: leave.status,
            date: dateHelper.formatDate(leave.date_),
            reason: leave.reason
        }

    }

}

module.exports = LeaveResponse;