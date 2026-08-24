const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");
const notificationConfig = require("../../config/NotificationConfig");

app.timer("OvertimeClockOutReminder", {
    schedule: constant.OVERTIME_REMINDER,
    handler: async (myTimer, context) => {
        if (!notificationConfig.isReminderEnabled('overtimeClockOutReminder')) {
            logger.info("Overtime reminder is disabled");
            return;
        }
        try {
            await notificationService.notifyOvertimeClockOutReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
