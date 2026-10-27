
const logger = require("../helpers/Logger");
const apiHelper = require("../helpers/ApiHelper");
/**
 * ============================================
 * Overtime API Service
 * ��������API�����ӥ�
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeApiService {
    /**
     * Initialize the overtime API on startup.
     * ��ư���˶���API���������ޤ���
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
     * ���Ȱ��λĶȤ�Ͽ����ˤϡ����մ���API��ƤӽФ��ޤ���
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
     * ���Ȱ��λĶȥǡ�����Ķȴ���API����������ޤ���
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

    /**
     * Send or edit overtime request to /kintai/zanRequest
     */
    async editOt(employee, userNo, payloadData) {
        try {
            const password = apiHelper.resolvePassword(employee);

            const token = await apiHelper.getValidToken({
                ...employee,
                PASSWORD: password
            });

            const response = await this._requestZanRequestApi(
                token,
                userNo,
                payloadData
            );

            if (response.statusCode >= 400) {
                throw new Error(response.body?.message || "Edit overtime request failed");
            }

            return response.body;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async _requestZanRequestApi(token, userNo, payloadData) {
        const payload = { ...payloadData };
        if (userNo) {
            payload.userNo = userNo;
        }

        const url = apiHelper.buildUrl(`/kintai/zanRequest`);

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
