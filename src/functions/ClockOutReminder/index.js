const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");

app.timer("ClockOutReminder", {
    schedule: constant.CLOCK_OUT_REMINDER,
    handler: async (myTimer, context) => {
        try {
            await notificationService.notifyClockOutReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
