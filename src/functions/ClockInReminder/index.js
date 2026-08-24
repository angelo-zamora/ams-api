const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");
const notificationConfig = require("../../config/NotificationConfig");

app.timer("ClockInReminder", {
    schedule: constant.CLOCK_IN_REMINDER,
    handler: async (myTimer, context) => {
        if (!notificationConfig.isReminderEnabled('clockInReminder')) {
            logger.info("Clock-in reminder is disabled");
            return;
        }
        try {
            await notificationService.notifyToClockinReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
