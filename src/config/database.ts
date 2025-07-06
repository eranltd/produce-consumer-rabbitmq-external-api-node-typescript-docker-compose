import knex from 'knex';

/**
 * Centralized Knex database connection configuration.
 *
 * It's configured to use environment variables for sensitive data,
 * falling back to local defaults for ease of development.
 *
 * Includes explicit connection pooling settings to manage database load effectively.
 * The `searchPath` property ensures all queries target the 'interviewdb' schema
 * by default, simplifying repository code.
 */
export const db = knex({
	client: 'pg',
	connection: {
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER || 'myuser',
		password: process.env.DB_PASSWORD || 'mypassword',
		database: process.env.DB_NAME || 'mydatabase',
	},
	pool: {
		min: 2,
		max: 10,
	},
	searchPath: ['interviewdb', 'public'],
});