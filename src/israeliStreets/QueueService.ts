import {connect, Connection, Channel} from 'amqplib';

class QueueService {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly queueName: string;

    constructor(queueName: string) {
        this.queueName = queueName;
    }

    async connect(): Promise<void> {
        const rabbitMqUrl:string = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        const options = { frameMax: 8192 };

        try {
            this.connection = await connect(rabbitMqUrl, options);
            console.log(`Connected to RabbitMQ at ${rabbitMqUrl}`);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            console.log(`Connected to RabbitMQ and queue "${this.queueName}" is ready.`);
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async produceMessage(message: string): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel is not initialized. Call connect() first.');
        }

        try {
            this.channel.sendToQueue(this.queueName, Buffer.from(message), { persistent: true });
            console.log(`Message sent to queue "${this.queueName}":`, message);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }
    async consumeMessage(onMessage: (message: string) => void): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel is not initialized. Call connect() first.');
        }

        try {
            await this.channel.consume(this.queueName, (msg) => {
                if (msg !== null) {
                    const messageContent = msg.content.toString();
                    console.log(`Message received from queue "${this.queueName}":`, messageContent);
                    onMessage(messageContent);
                    this.channel?.ack(msg);
                }
            }, { noAck: false });
        } catch (error) {
            console.error('Failed to consume message:', error);
            throw error;
        }
    }
    async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
            console.log('Connection to RabbitMQ closed.');
        } catch (error) {
            console.error('Failed to close RabbitMQ connection:', error);
        }
    }
}

export default QueueService;

// Example usage:
// (async () => {
//   const queueService = new QueueService('testQueue');
//   await queueService.connect('amqp://localhost');
//   await queueService.produceMessage('Hello, RabbitMQ!');
//   await queueService.close();
// })();