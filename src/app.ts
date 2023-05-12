import 'dotenv/config';
import { connect as DatabaseConnection } from 'mongoose';
import { startServer } from './apollo.server';
import { logger } from './common/helpers/logger';


DatabaseConnection(String(process.env.DATABASE_URL), {
	dbName: String(process.env.DATABASE_NAME),
	pass: String(process.env.DATABASE_PASS),
	user: String(process.env.DATABASE_USER),
	autoIndex: true,
	maxPoolSize: 10,
}).then(
	async () => {
		logger.info('connection to database successfully established');

		//Start server if database connection was successful
		await startServer();
	},
	(err) => {
		logger.error(err, 'An error occurred while connecting to database');
	}
);
