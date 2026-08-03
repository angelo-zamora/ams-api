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

    async notifyToClockinReminder() {
        const users = await attendanceRepository.getNoClockInUsersToday();
        
        console.log(`Sending new card reminder to ${users.length} employees.`);

        for (const user of users) {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;
            console.log(`To: ${email}`);
            
            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        // Delegate the reminder to the Teams Bot's internal endpoint.
                        // The bot will send the morning greeting + clock action card.
                        await botService.sendReminderToBot(
                            objectId,
                            constants.NOTIFICATIONS.DAILY_CLOCK_IN_REMINDER,
                            process.env.AZURE_TENANT_ID,
                            'ja-JP'
                        );
                        console.log(`Successfully sent DAILY_CLOCK_IN_REMINDER to: ${email}`);
                    }
                }
            } catch (error) {
                console.error(`Failed to send DAILY_CLOCK_IN_REMINDER to ${email}:`, error.message);
            }
        }
    }
}

module.exports = new NotificationService();
