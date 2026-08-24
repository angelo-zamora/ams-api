const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");
const notificationConfig = require("../../config/NotificationConfig");

app.timer("NoClockInReminder", {
    schedule: constant.NO_CLOCK_IN_REMINDER,
    handler: async (myTimer, context) => {
        if (!notificationConfig.isReminderEnabled('noClockInReminder')) {
            logger.info("Clock-out reminder is disabled");
            return;
        }
        try {
            await notificationService.notifyNoClockinReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
