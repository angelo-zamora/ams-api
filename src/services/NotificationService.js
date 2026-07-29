const employeeRepository = require("../repositories/EmployeeRepository");
const attendanceRepository = require("../repositories/AttendanceRepository");
const overtimeRepository = require("../repositories/OvertimeRepository");
const graphService = require("../graph/GraphService");
const dateHelper = require("../helpers/DateHelper");
const botService = require("./BotService");
const constants = require("../helpers/Constants");
/**
 * ============================================
 * Notification Service
 * 通知サービス
 * ============================================
 */

class NotificationService {

    async notifyClockOutReminder() {
        const users = await attendanceRepository.getStillClockedInUsers();
        
        console.log(`Sending clock out reminder to ${users.length} employees.`);
        
        const message = constants.NOTIFICATIONS.CLOCK_OUT_REMINDER;

        for (const user of users) {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
            console.log(`To: ${email}`);
            console.log(`Message: ${message}`);
            
            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        await botService.sendProactiveMessage(objectId, message);
                        console.log(`Successfully sent proactive Teams message to: ${email}`);
                    }
                }
            } catch (error) {
                console.error(`Failed to send proactive Teams message to ${email}:`, error.message);
            }
        }
    }

    async notifyOvertimeClockOutReminder() {
        const users = await overtimeRepository.getUsersOnOvertimeStillClockedIn();
        
        console.log(`Sending clock out Overtime reminder to ${users.length} employees.`);
        
        const message = constants.NOTIFICATIONS.OVERTIME_CLOCK_OUT_REMINDER;

        for (const user of users) {
                const otStart = new Date();
                otStart.setHours(
                    Number(user.OT_STARTHOUR),
                    Number(user.OT_STARTMIN),
                    0,
                    0
                );

                const diffMinutes = Math.floor((dateHelper.now() - otStart) / 60000);

                if (diffMinutes >= 180) {
                    const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
                    console.log(`To: ${email}`);
                    console.log(`Message: ${message}`);
                    
                    try {
                        if (email) {
                            const objectId = await graphService.getUserObjectId(email);
                            if (objectId) {
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

    async notifyNoClockinReminder() {
        const users = await attendanceRepository.getNoClockInUsers();
        
        console.log(`Sending no clock in reminder to ${users.length} employees.`);
        
        const message = constants.NOTIFICATIONS.NO_CLOCK_IN_REMINDER;

        for (const user of users) {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
            console.log(`To: ${email}`);
            console.log(`Message: ${message}`);
            
            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        await botService.sendProactiveMessage(objectId, message);
                        console.log(`Successfully sent proactive Teams message to: ${email}`);
                    }
                }
            } catch (error) {
                console.error(`Failed to send proactive Teams message to ${email}:`, error.message);
            }
        }
    }

    async notifyNoClockOutReminder() {
        const users = await attendanceRepository.getStillNoClockOutUsers();
        
        console.log(`Sending clock out reminder to ${users.length} employees.`);
        
        const message = constants.NOTIFICATIONS.NO_CLOCK_OUT_REMINDER;

        for (const user of users) {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
            console.log(`To: ${email}`);
            console.log(`Message: ${message}`);
            
            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
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
