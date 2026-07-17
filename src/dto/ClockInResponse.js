const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");

/**
 * ============================================
 * Clock In Response DTO
 * 出勤レスポンス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class ClockInResponse {

    constructor(employee, locale, warning = null) {

        this.success = true;

        this.message = localeHelper.translate("CLOCK_IN_COMPLETED", locale);

        this.code = constants.STATUS.CLOCK_IN_SUCCESS;
    }

}

module.exports = ClockInResponse;