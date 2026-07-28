const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const localeHelper = require("../helpers/LocaleHelper");

const tenantId = process.env.AZURE_TENANT_ID;
const audience = process.env.AZURE_CLIENT_ID;

const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000
});
/**
 * ============================================
 * JWT Validator
 * JWT 認証ミドルウェア
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
function getSigningKey(header, callback) {

    console.log("JWT Header:", header);

    client.getSigningKey(header.kid, (err, key) => {

        console.log("JWKS Error:", err);
        console.log("JWKS Key:", key);

        if (err) {
            return callback(err);
        }

        callback(null, key.getPublicKey());

    });

}

class JwtValidator {

    async validate(request, locale) {

        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            throw new Error(
                localeHelper.translate(
                    "MISSING_AUTHORIZATION_HEADER",
                    locale
                )
            );
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new Error(
                localeHelper.translate(
                    "INVALID_AUTHORIZATION_HEADER",
                    locale
                )
            );
        }

        const accessToken = authHeader.substring(7);

        const decoded = jwt.decode(accessToken);

        console.log("aud:", decoded.aud);
        console.log("scp:", decoded.scp);
        console.log("iss:", decoded.iss);

        const claims = await new Promise((resolve, reject) => {

            jwt.verify(
                accessToken,
                getSigningKey,
                {
                    algorithms: ["RS256"],

                    audience: [
                        process.env.API_CLIENT_ID,
                        `api://${process.env.API_CLIENT_ID}`
                    ],

                    issuer: [
                        `https://sts.windows.net/${tenantId}/`,
                        `https://login.microsoftonline.com/${tenantId}/v2.0`
                    ]
                },
                (err, decoded) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded);
                    }

                }
            );

        });

        return {
            accessToken,
            claims
        };

    }

}

module.exports = new JwtValidator();