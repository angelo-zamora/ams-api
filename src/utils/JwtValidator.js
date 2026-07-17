const localeHelper = require("../helpers/LocaleHelper");

/**
 * ============================================
 * JWT Validator
 * JWT??????
 * ============================================
 */

class JwtValidator {

    validate(request, locale) {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            throw new Error(localeHelper.translate("MISSING_AUTHORIZATION_HEADER", locale));
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new Error(localeHelper.translate("INVALID_AUTHORIZATION_HEADER", locale));
        }

        return authHeader.replace("Bearer ", "");

    }

}

module.exports = new JwtValidator();