const overtimeRepository = require("../repositories/OvertimeRepository");
const employeeService = require("./EmployeeService");
const overtimeApiService = require("./OvertimeApiService");
const validator = require("../validators/OvertimeValidator");

/**
 * ============================================
 * Overtime Service
 * ���Х����ӥ�
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
class OvertimeService {

    /**
     * Save Overtime request
     * �Ķȿ�����Ͽ���롣
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
     * ���Ȱ��λĶȿ�����������롣
     */
    async getOvertime(session, request, locale) {
        const email = session.currentUser.email;
        
        const employee = await employeeService.validateEmployee(email, locale);

        const overtime = await overtimeRepository.getOvertime(employee.USERNO, request.params.reqDate);

        validator.validateTodayOvertime(overtime);

        return overtime;
    }

    /**
     * Edit or send Overtime request with optional userNo
     */
    async editOt(session, payload, locale) {
        const email = session.currentUser.email;
        const employee = await employeeService.validateEmployee(email, locale);

        // If userNo is not provided in payload, default to logged-in user's USERNO
        const targetUserNo = payload?.userNo ? payload.userNo : employee.USERNO;

        const editData = await overtimeApiService.editOt(
            employee,
            targetUserNo,
            payload
        );

        return editData;
    }

}

module.exports = new OvertimeService();