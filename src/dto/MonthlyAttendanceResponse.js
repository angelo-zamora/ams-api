class MonthlyAttendanceResponse {
    constructor(data, locale) {
        this.totalData = data?.totalData ?? 0;
        this.currentPage = data?.currentPage ?? 0;
        this.year = data?.year ?? null;
        this.month = data?.month ?? null;

        this.accounts = (data?.accounts || []).map(item => ({
            date: item.date,
            status: item.status,
            startTime: item.startTime,
            endTime: item.endTime,
            day: item.day,
            reason: item.reason,
            zanRequest: item.zanRequest,
            zanReason: item.zanReason,
            remark: item.remark
        }));
    }
}

module.exports = MonthlyAttendanceResponse;