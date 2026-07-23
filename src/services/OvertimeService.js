const overtimeRepository = require("../repositories/OvertimeRepository");
const employeeService = require("./EmployeeService");
const overtimeApiService = require("./OvertimeApiService");
const validator = require("../validators/OvertimeValidator");

/**
 * ============================================
 * Overtime Service
 * 外出サービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeService {

    /**
     * Save Overtime request
     * 残業申請を記録する。
     */
    async save(payload, session, locale) {

        const email = session.currentUser.email;
        
        const employee = await employeeService.validateEmployee(email, locale);
        
        validator.validateRequest(payload.params);

        const overtime = await overtimeRepository.getOvertime(employee.USERNO, payload.params.workYear + payload.params.workMonth + payload.params.workDay);

        validator.validateExistingOvertime(overtime);

        await overtimeApiService.overtime(employee, payload.params);

        return null;
    }

    /**
     * Get employee overtime request
     * 従業員の残業申請を取得する。
     */
    async getOvertime(session, request, locale) {
        const email = session.currentUser.email;
        
        const employee = await employeeService.validateEmployee(email, locale);

        const overtime = await overtimeRepository.getOvertime(employee.USERNO, request.params.reqDate);

        validator.validateTodayOvertime(overtime);

        return overtime;
    }

}

module.exports = new OvertimeService();