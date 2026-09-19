const { app } = require("@azure/functions");
const auth = require("../../middleware/AuthenticationMiddleware");
const cors = require("../../middleware/CorsMiddleware");
const userInfo = require("../../controllers/UserController");
const response = require("../../helpers/ResponseHelper");

app.http("GetUserInfo", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try{
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);
            const result = await userInfo.getUserInfo(session,locale);
            if (!result) {
                return response.notFoundWithCors("USER_NOT_FOUND", locale, request);
            }
            return response.successWithCors(result, locale, request)

        } catch(error){
            context.error(error);
            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }
    }

});

app.http("GetUserMembers", {
    methods: ["GET", "OPTIONS"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        const preflightResponse = cors.handlePreflight(request);
        if (preflightResponse) return preflightResponse;

        try {
            const locale = request.headers.get("x-locale") || request.headers.get("x-language") || "en";
            const session = await auth.authenticate(request);
            const result = await userInfo.getUserMembers(session, locale);
            return response.successWithCors(result, locale, request);
        } catch (error) {
            context.error(error);
            return response.serverErrorWithCors(error, request.headers.get("x-locale") || "en", request);
        }
    }
});