const tokenRepository = require("../repositories/TokenRepository");
const attendanceApiConfig = require("../config/AttendanceApiConfig");
const logger = require("../helpers/Logger");

class ApiHelper {
    constructor() {
        this.initializationPromise = null;
    }

    /**
     * Get a valid access token for the employee, either from cache or by requesting a new one.
     * 従業員用の有効なアクセストークンを、キャッシュから取得するか、新しいトークンを要求することで取得します。
     * @param {Object} employee - The employee object containing USERNO and PASSWORD.
     * @returns {Promise<string>} - The valid access token.
     */ 
    async initializeOnStartup(employee) {
        if (!this.initializationPromise) {
            this.initializationPromise = this._initializeToken(employee);
        }

        try {
            return await this.initializationPromise;
        } finally {
            this.initializationPromise = null;
        }
    }

    async getValidToken(employee) {
        const normalizedEmployee = this._resolveCredentials(employee);
        const cachedToken = tokenRepository.get(normalizedEmployee.USERNO);
        const now = Date.now();

        if (cachedToken && this._isTokenValid(cachedToken, now)) {
            return cachedToken.access_token;
        }

        const tokenResponse = await this._requestToken(normalizedEmployee, cachedToken?.refresh_token);
        const tokenPayload = {
            access_token: tokenResponse.body.access_token,
            refresh_token: tokenResponse.body.refresh_token,
            expires_in: tokenResponse.body.expires_in,
            token_expiration_time: new Date(now + Number(
                tokenResponse.body.expires_in || 3600) * 1000
            ).toISOString()
        };

        tokenRepository.set(normalizedEmployee.USERNO, tokenPayload);
        return tokenPayload.access_token;
    }

    /**
     * Build the full URL for the attendance API endpoint.
     * 勤怠管理APIのエンドポイントの完全なURLを構築します。
     * @param {string} path - The path to append to the base URL.
     * @returns {string} - The full URL.
    */
    buildUrl(path) {
        if (!attendanceApiConfig.baseUrl) {
            throw new Error("ATTENDANCE_API_BASE_URL is not configured.");
        }

        const normalizedBaseUrl = attendanceApiConfig.baseUrl.replace(/\/$/, "");
        const endpoint = path?.startsWith("/") ? path : `/${path || ""}`;
        return `${normalizedBaseUrl}${endpoint}`;
    }

    /**
     * Make a request to the attendance API with retries.
     * 勤怠管理APIへのリクエストをリトライします。
     * @param {Object} payload - The request payload containing method, url, headers, and body.
     * @param {number} attempt - The current attempt number for retries.
     * @returns {Promise<Object>} - The response from the attendance API.
    */
    async requestWithRetry(payload, attempt = 1) {
        try {
            const response = await this._defaultHttpClient(payload);
            if (response.statusCode >= 500 && attempt <= 2) {
                await new Promise(resolve => setTimeout(resolve, 200 * attempt));
                return this.requestWithRetry(payload, attempt + 1);
            }
            return response;
        } catch (error) {
            if (attempt <= 2) {
                await new Promise(resolve => setTimeout(resolve, 200 * attempt));
                return this.requestWithRetry(payload, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Default HTTP client for making requests to the attendance API.
     * 勤怠管理APIへのリクエストを行うためのテ?フォルトのHTTPクライアントを提供します。
     * @private
    */
    async _defaultHttpClient({ method, url, headers, body }) {
        const fetchImpl = global.fetch || require("node-fetch");

        const response = await fetchImpl(url, {
            method,
            headers,
            body
        });

        const text = await response.text();
        let payload;

        try {
            payload = text ? JSON.parse(text) : {};
        } catch (error) {
            payload = { raw: text };
        }

        return {
            statusCode: response.status,
            body: payload
        };
    }

    /**
     * Resolve the password for the employee.
     * 従業員のハ?スワードを解決します。
     * @private
    */
    resolvePassword(employee) {
        return this._resolveCredentials(employee).PASSWORD;
    }

    _resolveCredentials(employee) {
        const resolvedEmployee = { ...employee };

        if (!resolvedEmployee.USERNO) {
            resolvedEmployee.USERNO = process.env.ATTENDANCE_API_USERNO || process.env.ATTENDANCE_API_STARTUP_USERNO || null;
        }

        if (!resolvedEmployee.PASSWORD) {
            resolvedEmployee.PASSWORD = process.env.ATTENDANCE_API_PASSWORD || process.env.ATTENDANCE_API_STARTUP_PASSWORD || null;
        }

        return resolvedEmployee;
    }

    /**
     * Request a new access token from the attendance API using employee credentials.
     * 従業員の認証情報を使用して、勤怠管理APIから新しいアクセストークンをリクエストします。
     * @private
    */
    async _requestToken(employee, refreshToken = null) {
        const tokenEndpoint = this.buildUrl("oauth/token");
        const bodyParams = refreshToken
            ? {
                grant_type: "refresh_token",
                refresh_token: refreshToken
            }
            : {
                grant_type: "password",
                username: employee.USERNO,
                password: employee.PASSWORD
            };

        const body = new URLSearchParams(bodyParams).toString();

        return this.requestWithRetry({
            method: "POST",
            url: tokenEndpoint,
            headers: {
                Authorization: `Basic ${attendanceApiConfig.basicAuth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body
        });
    }

    /**
     * Check if the token is still valid based on its expiration time.
     * トークンの有効期限に基づいて、トークンがまだ有効かどうかを確認します。
     * @private
    */
    _isTokenValid(token, now) {
        if (!token?.token_expiration_time) {
            return false;
        }
        return new Date(token.token_expiration_time).getTime() > now;
    }

    async _initializeToken(employee) {
        try {
            const normalizedEmployee = this._resolveCredentials(employee);
            if (!normalizedEmployee.USERNO || !normalizedEmployee.PASSWORD) {
                return null;
            }

            return await this.getValidToken(normalizedEmployee);
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
}

module.exports = new ApiHelper();