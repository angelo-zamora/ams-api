const localeHelper = require("./LocaleHelper");

/**
 * ============================================
 * Response Helper
 * レスポンスヘルパー
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class ResponseHelper {

    success(data, locale) {

        return {
            status: 200,
            jsonBody: {
                success: true,
                data
            }
        };

    }

    badRequest(message, locale) {

        return {
            status: 400,
            jsonBody: {
                success: false,
                message: localeHelper.translate(message, locale)
            }
        };

    }

    unauthorized(locale) {

        return {
            status: 401,
            jsonBody: {
                success: false,
                message: localeHelper.translate("UNAUTHORIZED", locale)
            }
        };

    }

    serverError(error, locale) {
        const resolvedLocale = localeHelper.resolveLocale(locale);
        const messageKey = typeof error?.message === "string" ? error.message.toUpperCase() : "SERVER_ERROR";
        const translatedMessage = localeHelper.translate(messageKey, resolvedLocale);

        return {
            status: 500,
            jsonBody: {
                success: false,
                message: translatedMessage
            }
        };
    }
}

module.exports = new ResponseHelper();