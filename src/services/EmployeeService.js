const employeeRepository = require("../repositories/mysql/EmployeeRepository");
const localeHelper = require("../helpers/LocaleHelper");
/**
 * ============================================
 * Employee Service
 * 社員サービス
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class EmployeeService {

    async getByEmail(email) {

        return await employeeRepository.findByEmail(email);
    }

    async validateEmployee(email, locale) {

        const employee = await this.getByEmail(email);

        if (!employee) {
            throw new Error(localeHelper.translate("EMPLOYEE_NOT_FOUND", locale));
        }

        return employee;
    }
}

module.exports = new EmployeeService();
