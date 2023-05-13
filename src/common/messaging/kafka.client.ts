import { Consumer, Kafka, Producer, SASLOptions, logLevel } from "kafkajs";
import { KafkaProducerMessage } from "../types";

class KafkaClient {
	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;

	constructor() {
		const {
			KAFKA_BROKER_URL: brokerUrl,
			KAFKA_USERNAME: username,
			KAFKA_PASSWORD: password,
			KAFKA_CLIENT_ID: clientId,
			KAFKA_GROUP_ID: groupId,
			KAFKA_CONSUMER_SESSION_TIMEOUT_MS: consumerSessionTimeout,
			KAFKA_SESSION_TIMEOUT_MS: sessionTimeout,
		} = process.env;

		const sasl =
			username && password
				? { username, password, mechanism: "plain" }
				: { mechanism: "plain" };
		const ssl = !!sasl;

		// This creates a client instance that is configured to connect to the Kafka broker provided by
		// the environment variable KAFKA_BOOTSTRAP_SERVER
		this.kafka = new Kafka({
			clientId: clientId,
			brokers: [brokerUrl || ""],
			// logLevel: logLevel.INFO,
			ssl,
			sasl: sasl as SASLOptions,
			connectionTimeout: Number(sessionTimeout),
		});

		this.producer = this.kafka.producer();
		this.consumer = this.kafka.consumer({
			groupId: groupId || "",
			sessionTimeout: Number(consumerSessionTimeout),
		});
	}

	async connect(): Promise<void> {
		await this.producer.connect();
		await this.consumer.connect();
	}

	async disconnect(): Promise<void> {
		await this.producer.disconnect();
		await this.consumer.disconnect();
	}

	async createNotExistingTopic(topic: string): Promise<void> {
		await this.connect();
		const admin = this.kafka.admin();
		const topics = await admin.listTopics();
		const topicExists = topics.find((name) => name === topic);
		if (!topicExists) {
			await admin.createTopics({
				topics: [
					{
						topic,
						numPartitions: 1,
						replicationFactor: 3,
						configEntries: [{ name: "cleanup.policy", value: "delete" }],
					},
				],
			});
			await this.disconnect();
		}
	}

	async produce(
		topic: string,
		messages: KafkaProducerMessage[]
	): Promise<void> {
		await this.connect();
		await this.producer.send({
			topic: topic,
			messages: messages,
		});
		await this.disconnect();
	}

	async consume(topic: string): Promise<string> {
		return new Promise(async (resolve) => {
			await this.connect();
			await this.consumer.subscribe({ topic: topic, fromBeginning: true });
			await this.consumer.run({
				eachMessage: async ({ topic, partition, message }) => {
					if (!message?.value) {
						return resolve("");
					}
					const value = message?.value.toString();
					return resolve(value);
				},
			});
			await this.disconnect();
		});
	}
}

export default KafkaClient;
