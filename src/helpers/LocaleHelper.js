/**
 * ============================================
 * Locale Helper
 * ¿����إ�ѡ�
 * ============================================
 */
class LocaleHelper {
    constructor() {
        this.defaultLocale = "en";
        this.supportedLocales = ["en", "ja"];
        this.messages = {
            en: {
                CLOCK_IN_COMPLETED: "Clock In completed.",
                CLOCK_OUT_COMPLETED: "Clock Out completed.",
                ALREADY_CLOCKED_IN_TODAY: "Already clocked in today.",
                ALREADY_CLOCKED_IN: "Already clocked in.",
                ALREADY_CLOCKED_OUT: "Already clocked out.",
                NO_CLOCK_IN_FOUND: "No Clock In found.",
                CLOCK_IN_RECORD_NOT_FOUND: "Clock In record not found.",
                EMPLOYEE_NOT_FOUND: "Employee not found.",
                CLOCK_IN_FAILED: "Clock In failed.",
                MISSING_AUTHORIZATION_HEADER: "Missing Authorization Header",
                INVALID_AUTHORIZATION_HEADER: "Invalid Authorization Header",
                UNAUTHORIZED: "Unauthorized",
                SERVER_ERROR: "Internal Server Error",
                ALREADY_OVERTIME_REQ_TODAY: "Already overtime request today.",
                OVERTIME_COMPLETED: "Overtime Request completed.",
                OVERTIME_NOT_FOUND: "Overtime not found.",
                LEAVE_REQUEST_NOT_FOUND: "Leave Request not found.",
                LEAVE_COMPLETED: "Leave Request completed.",
                NO_EDIT_HISTORY: "No edit history found",
                INVALID_PARAMETERS: "Invalid parameters provided.",
                SUCCESS: "Request completed successfully."
            },
            ja: {
                CLOCK_IN_COMPLETED: "�ǹ郎��λ���ޤ�����",
                CLOCK_OUT_COMPLETED: "��Ф���λ���ޤ�����",
                ALREADY_CLOCKED_IN_TODAY: "���Ǥ˽жкѤߤǤ���",
                ALREADY_CLOCKED_IN: "���Ǥ˽жкѤߤǤ���",
                ALREADY_CLOCKED_OUT: "���Ǥ���кѤߤǤ���",
                NO_CLOCK_IN_FOUND: "�же�Ͽ�����Ĥ���ޤ���",
                CLOCK_IN_RECORD_NOT_FOUND: "�же�Ͽ�����Ĥ���ޤ���",
                EMPLOYEE_NOT_FOUND: "���Ȱ������Ĥ���ޤ���",
                CLOCK_IN_FAILED: "�ǹ�˼��Ԥ��ޤ�����",
                MISSING_AUTHORIZATION_HEADER: "ǧ�ڥإå���������ޤ���",
                INVALID_AUTHORIZATION_HEADER: "ǧ�ڥإå�����̵���Ǥ�",
                UNAUTHORIZED: "ǧ�ڤ�ɬ�פǤ�",
                SERVER_ERROR: "�����С����顼��ȯ�����ޤ���",
                ALREADY_OVERTIME_REQ_TODAY: "���Ǥ˻Ķȿ����ѤߤǤ���",
                OVERTIME_COMPLETED: "�Ķȿ�������λ���ޤ�����",
                OVERTIME_NOT_FOUND: "�Ķȿ��������Ĥ���ޤ���",
                LEAVE_REQUEST_NOT_FOUND: "�ٲ˿��������Ĥ���ޤ���",
                LEAVE_COMPLETED: "�ٲ˿�������λ���ޤ�����",
                NO_EDIT_HISTORY: "ҡ߼Ľ˵Ƥ¬Ĥ���ޤ���",
                INVALID_PARAMETERS: "̵¸ʸ¤ʥѥ�᥿¤¬ä¡¤ޤ¤¤¿",
                SUCCESS: "¥ê¥¯¥¨¥¹¥È¤¬ÀǸ¤ËÊ®λ¤·¤Þ¤·¤¿"
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
