class OvertimeValidator {

    validateExistingOvertime(overtime) {
        if (overtime) {
            throw new Error("ALREADY_OVERTIME_REQ_TODAY");
        }
    }

    validateRequest(request) {
        const errors = [];

        if (!request) {
            throw new Error("INVALID_REQUEST");
        }

        this.validateReason(request.reason, errors);
        this.validateWorkDate(
            request.workYear,
            request.workMonth,
            request.workDay,
            errors
        );

        this.validateStartTime(
            request.zanStartHour,
            request.zanStartMinute,
            errors
        );

        this.validateEndTime(
            request.zanEndHour,
            request.zanEndMinute,
            errors
        );

        if (
            this.isValidTime(request.zanStartHour, request.zanStartMinute) &&
            this.isValidTime(request.zanEndHour, request.zanEndMinute)
        ) {
            this.validateTimeRange(
                request.zanStartHour,
                request.zanStartMinute,
                request.zanEndHour,
                request.zanEndMinute,
                errors
            );
        }

        if (errors.length > 0) {
            const error = new Error("VALIDATION_FAILED");
            error.errors = errors;
            throw error;
        }
    }

    validateReason(reason, errors) {
        if (!reason || reason.trim() === "") {
            errors.push("REASON_REQUIRED");
        }
    }

    validateWorkDate(year, month, day, errors) {
        if (!year || !month || !day) {
            errors.push("WORK_DATE_REQUIRED");
            return;
        }

        const y = Number(year);
        const m = Number(month);
        const d = Number(day);

        const workDate = new Date(y, m - 1, d);

        // Validate date
        const isValidDate =
            workDate.getFullYear() === y &&
            workDate.getMonth() === m - 1 &&
            workDate.getDate() === d;

        if (!isValidDate) {
            errors.push("INVALID_WORK_DATE");
            return;
        }

        // Validate current month/year only
        const today = new Date();

        if (
            y !== today.getFullYear() ||
            m !== (today.getMonth() + 1)
        ) {
            errors.push("CURRENT_MONTH_ONLY");
        }
    }

    validateStartTime(hour, minute, errors) {
        if (hour == null || minute == null) {
            errors.push("START_TIME_REQUIRED");
            return;
        }

        if (!this.isValidTime(hour, minute)) {
            errors.push("INVALID_START_TIME");
        }
    }

    validateEndTime(hour, minute, errors) {
        if (hour == null || minute == null) {
            errors.push("END_TIME_REQUIRED");
            return;
        }

        if (!this.isValidTime(hour, minute)) {
            errors.push("INVALID_END_TIME");
        }
    }

    isValidTime(hour, minute) {
        const h = Number(hour);
        const m = Number(minute);

        return (
            Number.isInteger(h) &&
            Number.isInteger(m) &&
            h >= 0 &&
            h <= 23 &&
            m >= 0 &&
            m <= 59
        );
    }

    validateTimeRange(startHour, startMinute, endHour, endMinute, errors) {
        const start = Number(startHour) * 60 + Number(startMinute);
        const end = Number(endHour) * 60 + Number(endMinute);

        if (end <= start) {
            errors.push("INVALID_TIME_RANGE");
        }
    }


    validateTodayOvertime(overtime) {
        if (!overtime) {
            throw new Error("OVERTIME_NOT_FOUND");
        }
    }
}

module.exports = new OvertimeValidator();