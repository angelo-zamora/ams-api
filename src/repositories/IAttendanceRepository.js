/**
 * Interface/Contract for Attendance Repository.
 */
class IAttendanceRepository {
    constructor() {
        if (this.constructor === IAttendanceRepository) {
            throw new Error("Cannot instantiate abstract class IAttendanceRepository directly.");
        }
    }

    /**
     * Find attendance records matching the specified filters.
     * @param {Object} filters
     * @param {string} [filters.userId]
     * @param {string} [filters.month] - Format: 'YYYY-MM'
     * @param {string} [filters.startMonth] - Format: 'YYYY-MM'
     * @param {string} [filters.endMonth] - Format: 'YYYY-MM'
     * @returns {Promise<Array>}
     */
    async find(filters) {
        throw new Error("Method 'find()' must be implemented.");
    }

    /**
     * Create/save a new attendance record.
     * @param {Object} record
     * @returns {Promise<Object>} The created record.
     */
    async create(record) {
        throw new Error("Method 'create()' must be implemented.");
    }
}

module.exports = IAttendanceRepository;
