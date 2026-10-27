const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const attendance = require("../../controllers/AttendanceController");
const response = require("../../helpers/ResponseHelper");
const cors = require("../../middleware/CorsMiddleware");

app.http("leave", {

    methods: ["POST"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await attendance.leave(request, session, locale);

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

app.http("getLeaveRequestByDate", {

    methods: ["GET"],

    authLevel: "anonymous",

    handler: async (request, context) => {
        try {

            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const result = await attendance.getLeaveRequestByDate(session, request.query.get("date"), locale);

            return response.success(result, locale);

        }
        catch (error) {
            context.error(error);

            if (error?.message === "LEAVE_REQUEST_NOT_FOUND") {
                return response.notFound("LEAVE_REQUEST_NOT_FOUND", request, error);
            }
            return response.serverError(error, request);
        }

    }

});

app.http("PostEditLeave", {
    methods: ["POST", "OPTIONS"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try {
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const payload = await request.json();

            const result = await attendance.editLeave(session, payload, locale);

            return response.successWithCors(result, locale, request);

        }
        catch (error) {
            context.error(error);

            if (error?.message === "VALIDATION_FAILED") {
                return response.badRequestWithCors("VALIDATION_FAILED", request, error);
            }

            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }
    }
});
