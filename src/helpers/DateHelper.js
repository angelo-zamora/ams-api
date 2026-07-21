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

    parseDateTime(dateStr, timeStr) {
        const year = Number(dateStr.slice(0, 4));
        const month = Number(dateStr.slice(4, 6)) - 1;
        const day = Number(dateStr.slice(6, 8));
        const [hour, minute] = timeStr.split(":").map(Number);
        
        // Determine the timezone offset by checking what a test UTC time looks like in our timezone
        const testUtcDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: config.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const parts = formatter.formatToParts(testUtcDate);
        const getTestHour = () => Number(parts.find(p => p.type === 'hour')?.value || 0);
        
        // Calculate the timezone offset in hours
        const offsetHours = getTestHour() - 12;
        
        // Convert input time to UTC by subtracting the offset
        const utcHour = hour - offsetHours;
        
        return new Date(Date.UTC(year, month, day, utcHour, minute, 0));
    }
}

module.exports = new DateHelper();