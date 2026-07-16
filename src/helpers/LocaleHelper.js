/**
 * ============================================
 * Locale Helper
 * 多言語ヘルパー
 * ============================================
 */
class LocaleHelper {
    constructor() {
        this.defaultLocale = "en";
        this.supportedLocales = ["en", "ja"];
        this.messages = {
            en: {
                CLOCK_IN_COMPLETED: "Time clock entry complete.",
                CLOCK_OUT_COMPLETED: "Clock Out completed.",
                ALREADY_CLOCKED_IN_TODAY: "Already clocked in today.",
                ALREADY_CLOCKED_IN: "Already clocked in.",
                ALREADY_CLOCKED_OUT: "Already clocked out.",
                NO_CLOCK_IN_FOUND: "No Clock In found.",
                CLOCK_IN_RECORD_NOT_FOUND: "Clock In record not found.",
                EMPLOYEE_NOT_FOUND: "Employee not found.",
                MISSING_AUTHORIZATION_HEADER: "Missing Authorization Header",
                INVALID_AUTHORIZATION_HEADER: "Invalid Authorization Header",
                UNAUTHORIZED: "Unauthorized",
                SERVER_ERROR: "Internal Server Error"
            },
            ja: {
                CLOCK_IN_COMPLETED: "打刻が完了しました。",
                CLOCK_OUT_COMPLETED: "退勤が完了しました。",
                ALREADY_CLOCKED_IN_TODAY: "すでに出勤済みです。",
                ALREADY_CLOCKED_IN: "すでに出勤済みです。",
                ALREADY_CLOCKED_OUT: "すでに退勤済みです。",
                NO_CLOCK_IN_FOUND: "出勤記録が見つかりません。",
                CLOCK_IN_RECORD_NOT_FOUND: "出勤記録が見つかりません。",
                EMPLOYEE_NOT_FOUND: "従業員が見つかりません。",
                MISSING_AUTHORIZATION_HEADER: "認証ヘッダーがありません",
                INVALID_AUTHORIZATION_HEADER: "認証ヘッダーが無効です",
                UNAUTHORIZED: "認証が必要です",
                SERVER_ERROR: "サーバーエラーが発生しました"
            }
        };
    }

    normalizeLocale(locale) {
        if (!locale) {
            return this.defaultLocale;
        }

        const normalized = String(locale).toLowerCase();

        if (normalized.startsWith("ja")) {
            return "ja";
        }

        if (normalized.startsWith("en")) {
            return "en";
        }

        return this.defaultLocale;
    }

    resolveLocale(input) {
        if (!input) {
            return this.defaultLocale;
        }

        if (typeof input === "string") {
            return this.normalizeLocale(input);
        }

        if (input.headers && typeof input.headers.get === "function") {
            const headerLocale = input.headers.get("x-locale") || input.headers.get("x-language") || input.headers.get("accept-language");
            if (headerLocale) {
                return this.normalizeLocale(headerLocale);
            }
        }

        if (input.query && input.query.locale) {
            return this.normalizeLocale(input.query.locale);
        }

        if (input.query && input.query.lang) {
            return this.normalizeLocale(input.query.lang);
        }

        return this.defaultLocale;
    }

    translate(key, locale) {
        if (!key) {
            return "";
        }

        const resolvedLocale = this.normalizeLocale(locale);
        const localeMessages = this.messages[resolvedLocale] || this.messages[this.defaultLocale];

        if (localeMessages && localeMessages[key]) {
            return localeMessages[key];
        }

        return key;
    }
}

module.exports = new LocaleHelper();
