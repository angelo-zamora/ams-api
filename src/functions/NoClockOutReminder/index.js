const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");

app.timer("NoClockOutReminder", {
    schedule: constant.NO_CLOCK_OUT_REMINDER,
    handler: async (myTimer, context) => {
        try {
            await notificationService.notifyNoClockOutReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
