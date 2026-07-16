const localeHelper = require("../helpers/LocaleHelper");

/**
 * ============================================
 * Clock Out Response DTO
 * ???????
 * ============================================
 */

class ClockOutResponse {

    constructor(employee, locale) {

        this.success = true;

        this.message = localeHelper.translate("CLOCK_OUT_COMPLETED", locale);

        this.employee = {};

    }

}

module.exports = ClockOutResponse;