/**
 * ============================================
 * Notification Service
 * 通知サービス
 * ============================================
 */

const employeeRepository = require("../repositories/EmployeeRepository");
const attendanceRepository = require("../repositories/AttendanceRepository");

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

    async notifyClockOutReminder() {
        const graphService = require("../graph/GraphService");
        const users = await attendanceRepository.getStillClockedInUsers();
        
        console.log(`Sending clock out reminder to ${users.length} employees.`);
        
        const message = "It looks like you're still clocked in. If you've finished work for the day, please clock out. If you intend to continue working, please submit an overtime request.";

        for (const user of users) {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
            console.log(`To: ${email}`);
            console.log(`Message: ${message}`);
            
            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        const botService = require("./BotService");
                        await botService.sendProactiveMessage(objectId, message);
                        console.log(`Successfully sent proactive Teams message to: ${email}`);
                    }
                }
            } catch (error) {
                console.error(`Failed to send proactive Teams message to ${email}:`, error.message);
            }
        }
    }

}

module.exports = new NotificationService();
