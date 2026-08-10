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
        LEAVE_REQUEST_SUCCESS: "LEAVE_REQUEST_SUCCESS",
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
        NO_CLOCK_OUT_REMINDER: "NO_CLOCK_OUT_REMINDER",
        DAILY_CLOCK_IN_REMINDER: "DAILY_CLOCK_IN_REMINDER",
        NO_CLOCK_IN_REMINDER: "**⏳️ まもなくシフト開始時間です**<br/><br/>勤務開始まであと1分ですが、まだ出勤打刻がされていません。勤怠カードから出勤打刻を行ってください。"
    },
    // 5:00 PM Philippine Time (Monday-Friday)
    CLOCK_OUT_REMINDER: "0 0 9 * * 1-5",

    // Every 5 minutes from 5:00 PM to 11:55 PM Philippine Time
    OVERTIME_REMINDER: "0 */5 9-15 * * 1-5",

    // 11:59 PM Monday-Friday (PHT)
    NO_CLOCK_OUT_REMINDER: "0 59 15 * * 1-5",

    // 7:30 AM PHT Monday-Friday
    CLOCK_IN_REMINDER: "0 30 23 * * 0-4",

    // 7:59 AM Philippine Time Monday-Friday
    // In UTC this is 11:59 PM on the previous day,
    // so Sunday-Thursday UTC corresponds to Monday-Friday PHT.
    NO_CLOCK_IN_REMINDER: "0 59 23 * * 0-4",

    LEAVE_STATUSES: {
        PAID_LEAVE: "1",              // 有
        AM_LEAVE: "2",                // 前半
        PM_LEAVE: "3",                // 後半
        COMPENSATORY: "6",            // 代
        SPECIAL_PAID_LEAVE: "9",      // 特有
        SPECIAL_LEAVE: "8",           // 特休
        ABSENCE_PRIOR_NOTICE: "10",   // 欠勤
        VACATION_LEAVE: "11",         // 夏休
        ABSENCE_PUBLIC_HOLIDAY: "12"  // 欠勤（公休）
    }
};
