
const logger = require("../helpers/Logger");
const apiHelper = require("../helpers/ApiHelper");
/**
 * ============================================
 * Overtime API Service
 * 外部勤怠APIサービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeApiService {
    /**
     * Initialize the overtime API on startup.
     * 起動時に勤怠APIを初期化します。
     * @param {Object} employee - The employee object containing USERNO and PASSWORD.
     * @returns {Promise<string>} - The valid access token.
     */
    async initializeOnStartup(employee) {
        try {
            return await apiHelper.initializeOnStartup(employee);
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
     * Over time an employee by calling the overtime API.
     * 従業員の残業を記録するには、勤怠管理APIを呼び出します。
     * @param {Object} employee - The employee object containing USERNO and PASSWORD.
     * @param {Object} payload - The payload to send to the API.
     * @returns {Promise<Object>} - The response from the attendance API.
     */
    async overtime(employee, payload) {
        try {
            const password = apiHelper.resolvePassword(employee);
            if (!employee?.USERNO || !password) {
                throw new Error("Employee credentials are required for attendance API clock in.");
            }

            payload.userNo = employee.USERNO;

            const token = await apiHelper.getValidToken({ ...employee, PASSWORD: password });
            const response = await this._requestOvertimeApi(token, "/kintai/zanRequest", payload);

            if (response.statusCode >= 400) {
                throw new Error(response.body?.message);
            }

            return response;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    /**
     * Request employee's overtime data from the overtime API.
     * 従業員の残業データを残業管理APIから取得します。
     * @private
    */
    async _requestOvertimeApi(token, $endpoint, payload) {
        const url = apiHelper.buildUrl(
            `${$endpoint}`
        );

        return apiHelper.requestWithRetry({
            method: "POST",
            url,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    }
}

module.exports = new OvertimeApiService();
