/**
 * ============================================
 * Notification Service
 * 通知サービス
 * ============================================
 */

const employeeRepository = require("../repositories/EmployeeRepository");

class NotificationService {

    async notifyLateClockIn() {

        const employees =
            await employeeRepository.getActiveEmployees();

        console.log(

            `Checking ${employees.length} employees.`

        );

        /*
            Future implementation

            Graph Teams Chat

            Adaptive Card

            Reminder

        */

    }

}

module.exports = new NotificationService();