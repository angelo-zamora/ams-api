const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

const allowedTenantIds = new Set(
    (process.env.ALLOWED_TENANT_IDS || "")
        .split(",")
        .map((tenantId) => tenantId.trim().toLowerCase())
        .filter(Boolean)
);

const existingTenantId = (process.env.AZURE_TENANT_ID || "")
    .trim()
    .toLowerCase();

if (existingTenantId) {
    allowedTenantIds.add(existingTenantId);
}

if (allowedTenantIds.size === 0) {
    throw new Error(
        "Configure ALLOWED_TENANT_IDS or the existing AZURE_TENANT_ID setting."
    );
}

const apiClientId = process.env.API_CLIENT_ID;

if (!apiClientId) {
    throw new Error("API_CLIENT_ID is not configured.");
}

const audiences = [
    apiClientId,
    `api://${apiClientId}`,
    "api://stp.onmicrosoft.com"
];

const client = jwksClient({
    jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000
});

class AuthenticationError extends Error {
    constructor(code, statusCode) {
        super(code);
        this.name = "AuthenticationError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
/**
 * ============================================
 * JWT Validator
 * JWT ǧ�ڥߥɥ륦����
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/21
 * ============================================
 */
function getSigningKey(header, callback) {
    client.getSigningKey(header.kid, (error, key) => {
        if (error) {
            callback(error);
            return;
        }

        callback(null, key.getPublicKey());
    });
}

class JwtValidator {

    async validate(request, locale) {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            throw new AuthenticationError("MISSING_AUTHORIZATION_HEADER", 401);
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new AuthenticationError("INVALID_AUTHORIZATION_HEADER", 401);
        }

        const accessToken = authHeader.substring(7);
        const claims = await new Promise((resolve, reject) => {
            jwt.verify(
                accessToken,
                getSigningKey,
                {
                    algorithms: ["RS256"],
                    audience: audiences
                },
                (error, verifiedClaims) => {
                    if (error) {
                        if (
                            error instanceof jwt.JsonWebTokenError ||
                            error.name === "SigningKeyNotFoundError"
                        ) {
                            reject(new AuthenticationError("INVALID_ACCESS_TOKEN", 401));
                            return;
                        }

                        reject(error);
                        return;
                    }

                    resolve(verifiedClaims);
                }
            );
        });

        if (!claims || typeof claims !== "object") {
            throw new AuthenticationError("INVALID_ACCESS_TOKEN", 401);
        }

        if (!Number.isFinite(claims.exp)) {
            throw new AuthenticationError("INVALID_ACCESS_TOKEN", 401);
        }

        const tokenTenantId = String(claims.tid || "").toLowerCase();

        if (!tokenTenantId) {
            throw new AuthenticationError("INVALID_ACCESS_TOKEN", 401);
        }

        if (!allowedTenantIds.has(tokenTenantId)) {
            throw new AuthenticationError("TENANT_NOT_ALLOWED", 403);
        }

        const expectedIssuer = claims.ver === "1.0"
            ? `https://sts.windows.net/${tokenTenantId}/`
            : claims.ver === "2.0"
                ? `https://login.microsoftonline.com/${tokenTenantId}/v2.0`
                : null;

        if (!expectedIssuer || claims.iss !== expectedIssuer) {
            throw new AuthenticationError("INVALID_ACCESS_TOKEN", 401);
        }

        return {
            accessToken,
            claims
        };

    }

}

module.exports = new JwtValidator();