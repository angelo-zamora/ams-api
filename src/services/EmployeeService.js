class EmployeeService {
    /**
     * @param {IEmployeeRepository} employeeRepository
     */
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    /**
     * Retrieve employees with optional filters.
     * @param {Object} [filters]
     * @param {string} [filters.name]
     * @param {string} [filters.department]
     * @param {string} [filters.office]
     * @returns {Promise<Array>}
     */
    async getEmployees(filters = {}) {
        return this.employeeRepository.find(filters);
    }

    async getEmployeeByEmployeeId(employeeId) {
        return this.employeeRepository.findByEmployeeId(employeeId);
    }
}

module.exports = EmployeeService;
