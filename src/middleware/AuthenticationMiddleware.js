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

        const {
            accessToken,
            claims
        } = await jwtValidator.validate(request, locale);
        
        const currentUser = {
            aadObjectId: claims.oid,
            email:
                claims.preferred_username ||
                claims.upn ||
                claims.unique_name,
            name:
                claims.name ||
                `${claims.given_name} ${claims.family_name}`
        };

        return {
            accessToken,
            currentUser
        };
    }
}

module.exports = new AuthenticationMiddleware();