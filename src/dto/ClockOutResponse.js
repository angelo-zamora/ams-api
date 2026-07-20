const localeHelper = require("../helpers/LocaleHelper");
const constants = require("../helpers/Constants");

/**
 * ============================================
 * Clock Out Response DTO
 * 出勤レスポンス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/20
 * ============================================
 */
class ClockOutResponse {

    constructor(employee, locale) {

        this.success = true;

        this.message = localeHelper.translate("CLOCK_OUT_COMPLETED", locale);

        this.code = constants.STATUS.CLOCK_OUT_SUCCESS;
    }

}

module.exports = ClockOutResponse;