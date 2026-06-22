/**
 * Interface/Contract for Employee Repository.
 */
class IEmployeeRepository {
    constructor() {
        if (this.constructor === IEmployeeRepository) {
            throw new Error("Cannot instantiate abstract class IEmployeeRepository directly.");
        }
    }

    /**
     * Find employees matching filters.
     * @param {Object} filters
     * @param {string} [filters.name]
     * @param {string} [filters.department]
     * @param {string} [filters.office]
     * @returns {Promise<Array>}
     */
    async find(filters) {
        throw new Error("Method 'find()' must be implemented.");
    }

    async findByEmployeeId(employeeId) {
        throw new Error("Method 'findByEmployeeId()' must be implemented.");
    }
}

module.exports = IEmployeeRepository;
