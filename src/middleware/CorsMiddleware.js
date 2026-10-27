/**
 * ============================================
 * CORS Middleware
 * Author: CRESS-INFO Ephraim
 * Date: 2026/09/08
 * ============================================
 */

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": (request) => request?.headers?.get?.("origin") || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-locale, x-language",
    "Access-Control-Allow-Credentials": "true"
};

class CorsMiddleware {

    getCorsHeaders(request) {
        return {
            "Access-Control-Allow-Origin": CORS_HEADERS["Access-Control-Allow-Origin"](request),
            "Access-Control-Allow-Methods": CORS_HEADERS["Access-Control-Allow-Methods"],
            "Access-Control-Allow-Headers": CORS_HEADERS["Access-Control-Allow-Headers"],
            "Access-Control-Allow-Credentials": CORS_HEADERS["Access-Control-Allow-Credentials"]
        };
    }

    handlePreflight(request) {
        if (request.method === "OPTIONS") {
            return {
                status: 200,
                headers: this.getCorsHeaders(request)
            };
        }
        return null;
    }
}

module.exports = new CorsMiddleware();
