/**
 * ============================================
 * Notification Configuration
 * 通知設定
 * Manages enable/disable settings for all reminders
 * Author: CRESS-INFO Angelo
 * Date: 2026/08/18
 * ============================================
 */

module.exports = {
    // Clock-in reminder: Daily notification before shift start
    clockInReminder: {
        enabled: process.env.ENABLE_CLOCK_IN_REMINDER !== "false",
        description: "Notification sent before shift start time (7:30 AM PHT)"
    },

    // Clock-out reminder: Notification at end of shift
    clockOutReminder: {
        enabled: process.env.ENABLE_CLOCK_OUT_REMINDER !== "false",
        description: "Notification sent at shift end time (5:00 PM PHT)"
    },

    // No clock-in reminder: Notification if employee hasn't clocked in
    noClockInReminder: {
        enabled: process.env.ENABLE_NO_CLOCK_IN_REMINDER !== "false",
        description: "Notification sent if no clock-in by 7:59 AM PHT"
    },

    // No clock-out reminder: Notification if employee hasn't clocked out
    noClockOutReminder: {
        enabled: process.env.ENABLE_NO_CLOCK_OUT_REMINDER !== "false",
        description: "Notification sent if no clock-out by 11:59 PM PHT"
    },

    // Overtime clock-out reminder: Periodic reminder during overtime hours
    overtimeClockOutReminder: {
        enabled: process.env.ENABLE_OVERTIME_REMINDER !== "false",
        description: "Periodic notification every 5 minutes during overtime hours (5:00 PM - 11:55 PM PHT)"
    },

    // Global enable/disable for all reminders
    globalEnabled: process.env.ENABLE_ALL_REMINDERS !== "false",

    /**
     * Check if a specific reminder is enabled
     * @param {string} reminderType - Type of reminder (e.g., 'clockInReminder', 'clockOutReminder')
     * @returns {boolean} - True if reminder is enabled
     */
    isReminderEnabled(reminderType) {
        if (!this.globalEnabled) {
            return false;
        }
        const reminder = this[reminderType];
        return reminder ? reminder.enabled : false;
    },

    /**
     * Get all enabled reminders
     * @returns {Object} - Object containing only enabled reminders
     */
    getEnabledReminders() {
        return {
            clockInReminder: this.isReminderEnabled('clockInReminder'),
            clockOutReminder: this.isReminderEnabled('clockOutReminder'),
            noClockInReminder: this.isReminderEnabled('noClockInReminder'),
            noClockOutReminder: this.isReminderEnabled('noClockOutReminder'),
            overtimeClockOutReminder: this.isReminderEnabled('overtimeClockOutReminder')
        };
    },

    /**
     * Get all reminder configurations
     * @returns {Object} - All reminder configurations
     */
    getAllReminders() {
        return {
            clockInReminder: this.clockInReminder,
            clockOutReminder: this.clockOutReminder,
            noClockInReminder: this.noClockInReminder,
            noClockOutReminder: this.noClockOutReminder,
            overtimeClockOutReminder: this.overtimeClockOutReminder
        };
    }
};
