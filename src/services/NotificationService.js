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

        for (const user of users) {
                const now = dateHelper.now();

                // OT Start
                const otStart = new Date(now);
                otStart.setHours(
                    Number(user.OT_STARTHOUR),
                    Number(user.OT_STARTMIN),
                    0,
                    0
                );

                // OT End (approved duration)
                const otEnd = new Date(now);
                otEnd.setHours(
                    Number(user.OT_ENDHOUR),
                    Number(user.OT_ENDMIN),
                    0,
                    0
                );

                // Handle OT crossing midnight (e.g. 22:00 - 01:00)
                if (otEnd < otStart) {
                    otEnd.setDate(otEnd.getDate() + 1);
                }

                // Total approved OT duration
                const totalMinutes = Math.floor(
                    (otEnd.getTime() - otStart.getTime()) / 60000
                );

                // Elapsed OT time
                const elapsedMinutes = Math.floor(
                    (now.getTime() - otStart.getTime()) / 60000
                );

                // Trigger once greater than or equal to the approved OT duration
                if (elapsedMinutes >= totalMinutes) {
                    const totalHours = Math.floor(totalMinutes / 60);
                    const remainingMinutes = totalMinutes % 60;

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
                                    constants.NOTIFICATIONS.OVERTIME_CLOCK_OUT_REMINDER,
                                    process.env.AZURE_TENANT_ID,
                                    'ja-JP'
                                );
                                console.log(`Successfully sent OVERTIME_CLOCK_OUT_REMINDER to: ${email}`);
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
                            constants.NOTIFICATIONS.NO_CLOCK_OUT_REMINDER,
                            process.env.AZURE_TENANT_ID,
                            'ja-JP'
                        );
                        console.log(`Successfully sent NO_CLOCK_OUT_REMINDER to: ${email}`);
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
