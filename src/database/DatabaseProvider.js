/**
 * Abstract Class representing a Database Provider.
 * Enforces a common contract for initialization, executing queries, and closing connections.
 */
class DatabaseProvider {
    constructor() {
        if (this.constructor === DatabaseProvider) {
            throw new Error("Cannot instantiate abstract class DatabaseProvider directly.");
        }
    }

    /**
     * Initializes database connections/pools.
     */
    async connect() {
        throw new Error("Method 'connect()' must be implemented.");
    }

    /**
     * Executes a database query.
     * @param {string} text - SQL statement or query identifier.
     * @param {Array} [params] - Query bind parameters.
     */
    async query(text, params) {
        throw new Error("Method 'query()' must be implemented.");
    }

    /**
     * Closes the database pool/connection.
     */
    async disconnect() {
        throw new Error("Method 'disconnect()' must be implemented.");
    }
}

module.exports = DatabaseProvider;
