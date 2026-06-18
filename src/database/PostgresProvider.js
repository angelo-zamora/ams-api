const { Pool } = require('pg');
const DatabaseProvider = require('./DatabaseProvider');

class PostgresProvider extends DatabaseProvider {
    constructor(config = {}) {
        super();
        this.config = {
            host: config.host || process.env.DB_HOST || 'localhost',
            port: parseInt(config.port || process.env.DB_PORT || '5435', 10),
            user: config.user || process.env.DB_USER || 'postgres',
            password: config.password || process.env.DB_PASSWORD || 'postgrespassword',
            database: config.database || process.env.DB_NAME || 'attendance_db',
            ssl: config.ssl !== undefined ? config.ssl : (process.env.DB_SSL === 'true'),
            maxConnections: parseInt(config.maxConnections || process.env.DB_MAX_CONNECTIONS || '10', 10)
        };
        this.pool = null;
    }

    async connect() {
        if (!this.pool) {
            this.pool = new Pool({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password,
                database: this.config.database,
                ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
                max: this.config.maxConnections,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            this.pool.on('error', (err) => {
                console.error('Unexpected error on idle PostgreSQL client', err);
            });
        }
        return this.pool;
    }

    async query(text, params) {
        const pool = await this.connect();
        return pool.query(text, params);
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}

module.exports = PostgresProvider;
