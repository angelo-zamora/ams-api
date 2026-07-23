const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");

app.timer("NoClockInReminder", {
    schedule: constant.NO_CLOCK_IN_REMINDER,
    handler: async (myTimer, context) => {
        try {
            await notificationService.notifyNoClockinReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
