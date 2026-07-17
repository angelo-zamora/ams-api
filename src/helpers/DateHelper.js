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

        return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;

    }

    parseDateTime(dateStr, timeStr) {
        const year = Number(dateStr.slice(0, 4));
        const month = Number(dateStr.slice(4, 6)) - 1;
        const day = Number(dateStr.slice(6, 8));
        const [hour, minute] = timeStr.split(":").map(Number);

        return new Date(year, month, day, hour, minute);
    }


}

module.exports = new DateHelper();