import { logger } from '../helpers/logger';
import KafkaClient from '../messaging/kafka.client';

export const sendMessageToTopic = async (
	topic: string,
	key: string,
	message: Record<string | number, unknown>
) => {
	try {
		const client = new KafkaClient();
		await client.createNotExistingTopic(topic);

		await client.produce(topic, [{key, value: JSON.stringify(message) }]);
	} catch (error) {
		logger.error({ error });
	}
};

export const consumeMessageFromTopic = async (
	topic: string
): Promise<Record<string | number, unknown>> => {
	try {
		const client = new KafkaClient();
		await client.createNotExistingTopic(topic);

		const value = await client.consume(topic);
		return JSON.parse(value);
	} catch (error) {
		logger.error({ error });
		return {};
	}
};
