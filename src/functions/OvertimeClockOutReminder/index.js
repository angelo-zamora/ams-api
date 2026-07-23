const { app } = require("@azure/functions");
const notificationService = require("../../services/NotificationService");
const logger = require("../../helpers/Logger");
const constant = require("../../helpers/Constants");c

app.timer("OvertimeClockOutReminder", {
    schedule: constant.OVERTIME_REMINDER,
    handler: async (myTimer, context) => {
        try {
            await notificationService.notifyOvertimeClockOutReminder();
        } catch (error) {
            logger.error(error);
            context.error(error);
        }
    }
});
