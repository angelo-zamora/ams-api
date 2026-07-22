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

    badRequest(message, locale, data = {}) {
        const resolvedLocale = localeHelper.resolveLocale(locale);

        return {
            status: 400,
            jsonBody: {
                success: false,
                message: localeHelper.translate(message, resolvedLocale),
                data
            }
        };

    }

    notFound(message, locale) {
        const resolvedLocale = localeHelper.resolveLocale(locale);

        return {
            status: 404,
            jsonBody: {
                success: false,
                message: localeHelper.translate(message, resolvedLocale)
            }
        };

    }

    unauthorized(locale) {
        const resolvedLocale = localeHelper.resolveLocale(locale);

        return {
            status: 401,
            jsonBody: {
                success: false,
                message: localeHelper.translate("UNAUTHORIZED", resolvedLocale)
            }
        };

    }

    conflict(message, locale, data = {}) {
        const resolvedLocale = localeHelper.resolveLocale(locale);

        return {
            status: 409,
            jsonBody: {
                success: false,
                data: {
                    message: localeHelper.translate(message, resolvedLocale),
                    code: message
                }
            }
        };

    }

    serverError(error, locale) {
        const resolvedLocale = localeHelper.resolveLocale(locale);
        const rawMessage = typeof error?.message === "string" ? error.message : "SERVER_ERROR";
        const messageKey = rawMessage.toUpperCase();
        const translatedMessage = localeHelper.translate(messageKey, resolvedLocale);
        const finalMessage = translatedMessage === messageKey ? rawMessage : translatedMessage;

        return {
            status: 500,
            jsonBody: {
                success: false,
                message: finalMessage
            }
        };
    }
}

module.exports = new ResponseHelper();