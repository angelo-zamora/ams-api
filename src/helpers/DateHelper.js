const config = require("../config/AppConfig");
/**
 * ============================================
 * Date Helper
 * 日付ヘルパー
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
class DateHelper {

    now() {

        return new Date();

    }

    date(date = new Date()) {

        return new Date(date).toLocaleDateString("ja-JP", {
            timeZone: config.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

    }

    time(date = new Date()) {

        return new Date(date).toLocaleTimeString("ja-JP", {
            timeZone: config.timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });

    }

    formatDate(dateStr) {

        if (!dateStr || !/^\d{8}$/.test(dateStr)) {
            return null;
        }

        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);

        return `${year}-${month}-${day}`;

    }

    datetime(date = new Date()) {

        const parts = new Intl.DateTimeFormat("ja-JP", {
            timeZone: config.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).formatToParts(new Date(date));

        const get = (type) => parts.find(p => p.type === type).value;

        return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;

    }

    formatDbDateTime(dateStr, hour, minute) {
        if (!dateStr || hour == null || minute == null) {
            return null;
        }

        const date = String(dateStr);

        return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ` +
            `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
}

module.exports = new DateHelper();