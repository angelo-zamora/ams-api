const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const attendance = require("../../controllers/AttendanceController");
const response = require("../../helpers/ResponseHelper");

app.http("ClockIn", {

    methods: ["POST"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await attendance.clockIn(session, locale);

            return response.success(result, locale);

        }
        catch (error) {
            context.error(error);

            if (error?.message === "ALREADY_CLOCKED_IN_TODAY") {
                return response.conflict("ALREADY_CLOCKED_IN_TODAY", request);
            }
            return response.serverError(error, request);
        }

    }

});