const employeeRepository = require("../repositories/EmployeeRepository");
const attendanceRepository = require("../repositories/AttendanceRepository");
const overtimeRepository = require("../repositories/OvertimeRepository");
const graphService = require("../graph/GraphService");
const dateHelper = require("../helpers/DateHelper");
const botService = require("./BotService");
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
        
        const message = "It looks like you're still clocked in. If you've finished work for the day, please clock out. If you intend to continue working, please submit an overtime request.";

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
        
        const message = "Your overtime session has been active for 3 hours. Do you want to continue working overtime?";

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
        
        const message = "It looks like you've not clocked in today. Please clock in.";

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
