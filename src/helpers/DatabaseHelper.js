const config = require("../config/AppConfig");
/**
 * ============================================
 * Date Helper
 * 日付ヘルパー
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 */
class DateHelper {

    now() {

        return new Date();
    }

    today() {

        return this.date();
    }

    date() {

        return this.now().toLocaleDateString("ja-JP", {
            timeZone: config.timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    }

    time() {

        return this.now().toLocaleTimeString("ja-JP", {
            timeZone: config.timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }
}

module.exports = new DateHelper();