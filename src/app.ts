import 'dotenv/config';
import { connection } from './database/database';
import { startServer } from './apollo.server';
import { logger } from './common/helpers/logger';
import { consumeMessageFromTopic } from './common/service/kafka.service';

connection.then(
	async () => {
		logger.info('connection to database successfully established');

		//Start server if database connection was successful
		await startServer();
		const message = await consumeMessageFromTopic('transactions');
		logger.info({ message });
	},
	(err) => {
		logger.error(err, 'An error occurred while connecting to database');
	}
);
