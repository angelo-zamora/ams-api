const overtimeService = require("../services/OvertimeService");
const OvertimeResponse = require("../dto/OvertimeResponse");
const constants = require("../helpers/Constants");

/**
 * ============================================
 * Overtime Controller
 * 外部勤怠APIサービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeController {

    /**
     * Employee overtime request
     * 従業員の残業申請を記録する。
     * @param {Object} payload - The payload to send to the API.
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<OvertimeResponse>} - The response containing employee information after clocking in.
     */
    async overtimeRequest(payload, session, locale) {
        await overtimeService.save(payload, session, locale);

        return new OvertimeResponse(null, locale);
    }

    /**
     * Get employee overtime request
     * 従業員の残業申請を取得する。
     * @param {Object} session - The session object containing user information.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<OvertimeResponse>} - The response containing employee information after clocking in.
     */
    async getOvertime(request, session, locale) {
        const overtime = await overtimeService.getOvertime(session, request, locale);

        return new OvertimeResponse(overtime, locale);
    }

    /**
     * Send or edit employee overtime request.
     * 残業申請・編集を行う。
     * @param {Object} session - The session object containing user information.
     * @param {Object} payload - The payload containing overtime edit parameters.
     * @param {string} locale - The locale for response messages.
     * @returns {Promise<Object>} - The response data from the overtime request action.
     */
    async editOt(session, payload, locale) {
        const result = await overtimeService.editOt(
            session,
            payload,
            locale
        );

        return result;
    }
}

module.exports = new OvertimeController();
