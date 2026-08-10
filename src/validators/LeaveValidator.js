const constants = require("../constants");
class LeaveValidator {

    validateRequest(request) {
        const errors = [];

        if (!request) {
            throw new Error("INVALID_REQUEST");
        }

        this.validateWorkDate(
            request.workYear,
            request.workMonth,
            request.workDay,
            errors
        );

        this.validateStatus(request.status, errors);
        
        this.validateReason(request.reason, errors);

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

    validateStatus(status, errors) {
        const validStatuses = Object.values(constants.LEAVE_STATUSES);
        if (!validStatuses.includes(String(status))) {
            errors.push("INVALID_STATUS");
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
    }

    validateLeave(leave) {
        if (!leave) {
            throw new Error("LEAVE_REQUEST_NOT_FOUND");
        }
    }
}

module.exports = new LeaveValidator();