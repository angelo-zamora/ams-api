
const logger = require("../helpers/Logger");
const apiHelper = require("../helpers/ApiHelper");
/**
 * ============================================
 * Attendance API Service
 * 外部勤怠APIサービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/15
 * ============================================
 */
class AttendanceApiService {
    /**
     * Initialize the attendance API on startup.
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
     * Clock in an employee by calling the attendance API.
     * 従業員の出勤を記録するには、勤怠管理APIを呼び出します。
     * @param {Object} employee - The employee object containing USERNO and PASSWORD.
     * @returns {Promise<Object>} - The response from the attendance API.
     */
    async clockIn(employee) {
        try {
            const password = apiHelper.resolvePassword(employee);
            if (!employee?.USERNO || !password) {
                throw new Error("Employee credentials are required for attendance API clock in.");
            }

            const token = await apiHelper.getValidToken({ ...employee, PASSWORD: password });
            const response = await this._requestAttendanceApi(token, employee.USERNO, "/kintai/attendance");

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
     * Clock out an employee by calling the attendance API.
     * 従業員の退勤を記録するには、勤怠管理APIを呼び出します。
     * @param {Object} employee - The employee object containing USERNO and PASSWORD.
     * @returns {Promise<Object>} - The response from the attendance API.
     */
    async clockOut(employee) {
        try {
            const password = apiHelper.resolvePassword(employee);
            if (!employee?.USERNO || !password) {
                throw new Error("Employee credentials are required for attendance API clock out.");
            }

            const token = await apiHelper.getValidToken({ ...employee, PASSWORD: password });
            const response = await this._requestAttendanceApi(token, employee.USERNO, '/kintai/leave');

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
     * Request employee's attendance data from the attendance API.
     * 従業員の勤怠データを勤怠管理APIから取得します。
     * @private
    */
    async _requestAttendanceApi(token, userNo, $endpoint) {
        const url = apiHelper.buildUrl(
            `${$endpoint}?id=${encodeURIComponent(userNo)}`
        );

        return apiHelper.requestWithRetry({
            method: "GET",
            url,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}

module.exports = new AttendanceApiService();
