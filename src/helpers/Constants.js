/**
 * ============================================
 * Constants
 * 定数
 * Author: CRESS-INFO Angelo
 * Date: 2026/07/14
 * ============================================
 */
module.exports = {

    STATUS: {
        CLOCK_IN_SUCCESS: "CLOCK_IN_SUCCESS",
        CLOCK_OUT_SUCCESS: "CLOCK_OUT_SUCCESS",
        OVERTIME_SUCCESS: "OVERTIME_COMPLETED",
        SUCCESS: "SUCCESS",
    },

    WARNING: {
        LATE_CLOCK_IN: "LATE_CLOCK_IN",
    },

    ATTENDANCE: {
        CLOCK_IN: "CLOCK_IN",
        CLOCK_OUT: "CLOCK_OUT"
    },

    SUBJECT_MAIL: {
        CLOCK_IN: "出勤",
        CLOCK_OUT: "退勤"
    },

    LATE_CLOCK_IN: {
        HOUR: 8,
        MINUTE: 16
    },

    NOTIFICATIONS: {
        CLOCK_OUT_REMINDER: "**⏳️ まもなくシフト終了時間です**<br/><br/>まだ退勤打刻がされていないようです。本日の業務を終了される場合は、退勤打刻を行ってください。引き続き業務を継続される場合は、残業申請を提出してください。",
        OVERTIME_CLOCK_OUT_REMINDER: "OVERTIME_CLOCK_OUT_REMINDER",
        NO_CLOCK_IN_REMINDER: "**⏳️ まもなくシフト開始時間です**<br/><br/>勤務開始まであと1分ですが、まだ出勤打刻がされていません。勤怠カードから出勤打刻を行ってください。"
    },

    CLOCK_OUT_REMINDER: "0 0 17 * * 1-5", // 5PM EVERYDAY MONDAY TO FRIDAY

    OVERTIME_REMINDER: "0 */5 17-23 * * 1-5", // EVERY 5 MINUTES FROM 5PM TO 11PM

    NO_CLOCK_IN_REMINDER: "0 59 7 * * 1-5" // 7:59AM EVERYDAY MONDAY TO FRIDAY
};
