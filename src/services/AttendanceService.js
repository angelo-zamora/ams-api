const { randomUUID } = require('crypto');

class AttendanceService {
    /**
     * @param {IAttendanceRepository} attendanceRepository
     */
    constructor(attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    /**
     * Retrieve attendance history for a given user, with optional filters.
     * @param {string} userId
     * @param {Object} [filters]
     * @param {string} [filters.month]
     * @param {string} [filters.startMonth]
     * @param {string} [filters.endMonth]
     * @returns {Promise<Array>}
     */
    async getHistory(userId, filters = {}) {
        // userId is optional — omit it to query all users (admin / report use cases)
        return this.attendanceRepository.find({ userId: userId || undefined, ...filters });
    }

    /**
     * Record a new check-in or check-out event.
     * @param {Object} data
     * @param {string} data.userId
     * @param {string} data.userName
     * @param {string} data.userEmail
     * @param {string} data.type - 'check-in' or 'check-out'
     * @param {string} [data.location]
     * @param {string} [data.notes]
     * @returns {Promise<Object>} The created attendance record.
     */
    async recordAttendance({ userId, userName, userEmail, type, location, notes }) {
        if (!userId) {
            throw new Error("User identity could not be verified.");
        }
        if (!type || (type !== 'check-in' && type !== 'check-out')) {
            throw new Error("Field 'type' is required and must be either 'check-in' or 'check-out'.");
        }

        const record = {
            id: randomUUID(),
            userId,
            userName,
            userEmail,
            timestamp: new Date().toISOString(),
            type,
            location: location || 'Not Specified',
            notes: notes || '',
        };

        return this.attendanceRepository.create(record);
    }
}

module.exports = AttendanceService;
