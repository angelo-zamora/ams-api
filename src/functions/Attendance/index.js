const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const attendance = require("../../controllers/AttendanceController");
const response = require("../../helpers/ResponseHelper");

app.http("GetAttendanceToday", {

    methods: ["GET"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await attendance.getAttendanceToday(session, locale);

            return response.success(result, locale);

        }
        catch (error) {
            context.error(error);
            if (error?.message === "NO_CLOCK_IN_FOUND") {
                return response.notFound("NO_CLOCK_IN_FOUND", request);
            }

            return response.serverError(error, request);
        }

    }

});
