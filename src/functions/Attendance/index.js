const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const cors = require("../../middleware/CorsMiddleware");
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

app.http("GetMonthlyAttendance", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    handler: async (request, context) => {

        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try {
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const accountId = request.query.get("accountId");
            const year = request.query.get("year");
            const month = request.query.get("month");

            const result = await attendance.getMonthlyAttendance(
                session,
                { accountId, year, month },
                locale
            );

            return response.successWithCors(result, locale, request);

        } catch (error) {
            context.error(error);

            if (error?.message === "NO_MONTHLY_ATTENDANCE_FOUND") {
                return response.notFoundWithCors("NO_MONTHLY_ATTENDANCE_FOUND", request.headers.get("x-locale") || "en", request);
            }
            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }
    }
});

app.http("GetAttendanceEditHistory", {

    methods: ["GET", "OPTIONS"],

    authLevel: "anonymous",

    handler: async (request, context) => {

        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try {
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const userNo = request.query.get("userNo");
            const date = request.query.get("date");

            if (!userNo || !date) {
                return response.badRequestWithCors("INVALID_PARAMETERS", locale, {
                    message: "userNo and date parameters are required"
                }, request);
            }

            const result = await attendance.getEditHistory(session, { userNo, date }, locale);

            if (!result || result.length === 0) {
                return response.notFoundWithCors("NO_EDIT_HISTORY", locale, request);
            }

            return response.successWithCors(result, locale, request);

        } catch (error) {
            context.error(error);

            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }

    }

});

app.http("GetFlex", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    handler: async (request, context) => {

        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try {
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);

            const userNo = request.query.get("userNo");
            const email = request.query.get("email");
            const workMonth = request.query.get("workMonth");
            const workYear = request.query.get("workYear");

            const result = await attendance.getFlex(
                session,
                { userNo, email, workMonth, workYear },
                locale
            );

            return response.successWithCors(result, locale, request);

        } catch (error) {
            context.error(error);

            if (error?.message === "NO_FLEX_FOUND") {
                return response.notFoundWithCors("NO_FLEX_FOUND", request.headers.get("x-locale") || "en", request);
            }
            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }
    }
});
