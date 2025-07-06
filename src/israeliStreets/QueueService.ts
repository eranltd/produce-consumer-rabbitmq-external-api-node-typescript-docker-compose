import amqp, {connect,  Channel, Connection, ConsumeMessage } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

export interface ConsumeOptions {
	deadLetterQueue: string;
}

export default class QueueService {
	public connection: Connection;
	public channel: Channel;

	constructor(private queueName: string) {}

	async connect(queueArgs: amqp.Options.AssertQueue = {}): Promise<void> {
		try {
			const options = {maxFrame:8192}
			this.connection = await connect(RABBITMQ_URL,options);

			// Add listeners for connection-level events. This is crucial for handling
			// network issues or RabbitMQ server restarts during the application's lifecycle.
			this.connection.on('error', (err) => {
				console.error('RabbitMQ connection error:', err.message);
			});

			this.connection.on('close', () => {
				console.warn('RabbitMQ connection closed. Reconnecting is advisable for long-running services.');
			});

			this.channel = await this.connection.createChannel();
			await this.channel.assertQueue(this.queueName, { durable: true, ...queueArgs });
			console.log(`Successfully connected to RabbitMQ and asserted queue "${this.queueName}"`);
		} catch (error) {
			console.error(`Failed to connect to RabbitMQ. Please ensure the service is running and accessible at ${RABBITMQ_URL}`);
			throw error; // Re-throw the error to allow the calling service to handle it (e.g., by exiting).
		}
	}

	async produceMessage(message: string): Promise<void> {
		if (!this.channel) {
			await this.connect();
		}
		this.channel.sendToQueue(this.queueName, Buffer.from(message), { persistent: true });
	}

	/**
	 * Sets up a consumer to listen to the queue with manual acknowledgement.
	 * If a dead-letter queue is specified, it configures the necessary
	 * exchange and bindings to automatically route failed messages.
	 * @param onMessage The callback function to process incoming messages.
	 * @param options Specifies configuration like the dead-letter queue.
	 */
	async consumeMessage(onMessage: (msg: ConsumeMessage) => void, options?: ConsumeOptions): Promise<void> {
		if (!this.channel) {
			await this.connect();
		}

		let queueArgs = {};

		// If a DLQ is specified, set up the required exchanges and queues.
		if (options?.deadLetterQueue) {
			const dlxName = `${this.queueName}-dlx`;
			const dlqName = options.deadLetterQueue;

			// 1. Assert the Dead-Letter Exchange
			await this.channel.assertExchange(dlxName, 'direct', { durable: true });

			// 2. Assert the Dead-Letter Queue
			await this.channel.assertQueue(dlqName, { durable: true });

			// 3. Bind the DLQ to the DLX
			await this.channel.bindQueue(dlqName, dlxName, '');

			// 4. Set arguments for the main queue to use the DLX
			queueArgs = {
				deadLetterExchange: dlxName,
			};
		}

		// Assert the main queue with DLX arguments if provided
		await this.channel.assertQueue(this.queueName, { durable: true, ...queueArgs });

		// Start consuming with manual acknowledgement (`noAck: false`)
		await this.channel.consume(this.queueName, onMessage, { noAck: false });
	}

	async close(): Promise<void> {
		if (this.channel) {
			await this.channel.close();
		}
		if (this.connection) {
			await this.connection.close();
		}
	}
}