const jwtValidator = require("../utils/JwtValidator");
const graphService = require("../graph/GraphService");
const localeHelper = require("../helpers/LocaleHelper");
/**
 * ============================================
 * Authentication Middleware
 * 認証ミドルウェア
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class AuthenticationMiddleware {

    async authenticate(request) {

        const locale = localeHelper.resolveLocale(request);
        const accessToken = jwtValidator.validate(request, locale);
        const currentUser = await graphService.getCurrentUser(accessToken);

        return {

            accessToken,
            currentUser
        };
    }
}

module.exports = new AuthenticationMiddleware();