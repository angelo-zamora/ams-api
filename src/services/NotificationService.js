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

    /**
     * Executes an array of async tasks with controlled concurrency.
     * @param {Array} items - List of items to process
     * @param {number} concurrency - Maximum parallel tasks (default 10)
     * @param {Function} workerFn - Async function to execute per item
     */
    async processConcurrently(items, concurrency = 10, workerFn) {
        if (!items || items.length === 0) return [];
        const concurrencyLimit = Math.max(1, Number(process.env.NOTIFICATION_CONCURRENCY) || concurrency);

        const executing = new Set();
        const results = [];

        for (const item of items) {
            const p = Promise.resolve().then(() => workerFn(item));
            results.push(p);
            executing.add(p);

            const clean = () => executing.delete(p);
            p.then(clean, clean);

            if (executing.size >= concurrencyLimit) {
                await Promise.race(executing);
            }
        }

        return Promise.allSettled(results);
    }

    async notifyClockOutReminder() {
        const users = await attendanceRepository.getStillClockedInUsers();

        console.log(`Sending clock out reminder to ${users.length} employees.`);

        const message = constants.NOTIFICATIONS.CLOCK_OUT_REMINDER;

        await this.processConcurrently(users, 10, async (user) => {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;

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
        });
    }

    async notifyOvertimeClockOutReminder() {
        const users = await overtimeRepository.getUsersOnOvertimeStillClockedIn();

        console.log(`Sending clock out Overtime reminder to ${users.length} employees.`);

        await this.processConcurrently(users, 10, async (user) => {
            const now = dateHelper.now();

            const otStart = new Date();
            otStart.setHours(
                Number(user.OT_STARTHOUR),
                Number(user.OT_STARTMIN), 0, 0);

            const diffMinutes = Math.floor((dateHelper.now() - otStart) / 60000);
            if (diffMinutes >= 180 && diffMinutes < 185) {
                const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;

                try {
                    if (email) {
                        const objectId = await graphService.getUserObjectId(email);
                        if (objectId) {
                            // Delegate the reminder to the Teams Bot's internal endpoint.
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
        });
    }

    async notifyNoClockinReminder() {
        const users = await attendanceRepository.getNoClockInUsers();

        console.log(`Sending no clock in reminder to ${users.length} employees.`);

        const message = constants.NOTIFICATIONS.NO_CLOCK_IN_REMINDER;

        await this.processConcurrently(users, 10, async (user) => {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;

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
        });
    }

    async notifyNoClockOutReminder() {
        const users = await attendanceRepository.getStillNoClockOutUsers();

        console.log(`Sending clock out reminder to ${users.length} employees.`);

        await this.processConcurrently(users, 10, async (user) => {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;

            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        // Delegate the reminder to the Teams Bot's internal endpoint.
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
        });
    }

    async notifyToClockinReminder() {
        const users = await attendanceRepository.getNoClockInUsersToday();

        console.log(`Sending new card reminder to ${users.length} employees.`);

        await this.processConcurrently(users, 10, async (user) => {
            const email = user.MAIL || user.mail || user.mailaddress || user.MAILADDRESS;

            try {
                if (email) {
                    const objectId = await graphService.getUserObjectId(email);
                    if (objectId) {
                        // Delegate the reminder to the Teams Bot's internal endpoint.
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
        });
    }
}

module.exports = new NotificationService();
