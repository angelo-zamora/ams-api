const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const overtime = require("../../controllers/OvertimeController");
const response = require("../../helpers/ResponseHelper");

app.http("overtime", {

    methods: ["POST"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await overtime.overtimeRequest(request, session, locale);

            return response.success(result, locale);

        }
        catch (error) {
            context.error(error);

            if (error?.message === "VALIDATION_FAILED") {
                return response.badRequest("VALIDATION_FAILED", request, error);
            }

            return response.serverError(error, request);
        }

    }

});

app.http("getOvertime", {

    methods: ["GET"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await overtime.getOvertime(request, session, locale);

            return response.success(result, locale);

        }
        catch (error) {
            context.error(error);
            return response.serverError(error, request);
        }

    }

});