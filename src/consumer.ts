import CitiesRepository from "./israeliStreets/repositories/CitiesRepository";
import QueueService from "./israeliStreets/QueueService";
import { CitiesAPIResponse } from "./israeliStreets/types/CitiesAPIResponse";
import { CITIES_QUEUE, CONSUMER_DEAD_LETTER_QUEUE } from './config/queues';
import { db } from './config/database';
import { ConsumeMessage } from 'amqplib';

// Function to check database connection
async function checkDatabaseConnection() {
	try {
		await db.raw("SELECT 1+1 AS result");
		console.log("Database connected successfully.");
	} catch (error) {
		console.error("Error connecting to the database:", error);
		process.exit(1);
	}
}

let queueService: QueueService;

// Main function to keep the app running

async function main() {
	await checkDatabaseConnection();

	console.log("App is running...");
	console.log("Connecting to RabbitMQ...");

	const citiesRepository = new CitiesRepository(db, null);
	queueService = new QueueService(CITIES_QUEUE);
	// The `consumeMessage` method will set up the full queue topology, including the DLX.
	// We connect here just to ensure the service is ready, but the critical declaration
	// happens within `consumeMessage`.
	await queueService.connect(); // This initial connect is now safe.

	const onMessage = async (msg: ConsumeMessage | null) => {
		if (msg === null) {
			return; // Consumer was cancelled
		}

		const messageContent = msg.content.toString();
		try {
			const data: CitiesAPIResponse = JSON.parse(messageContent);
			await citiesRepository.addCityWithStreets(data);
			// Acknowledge the message on successful processing
			queueService.channel.ack(msg);
		} catch (error) {
			console.error('Failed to process message. This is a "poison pill". Dropping (we should write it to DeadLetterQueue).', {
				errorMessage: (error as Error).message,
				messageContent,
			});
		}
	};

	// Start consuming with the DLQ option enabled.
	await queueService.consumeMessage(onMessage);
	console.log(`Consumer is now listening to the "${CITIES_QUEUE}" queue.`);

	//Simulate an always-running app
	setInterval(() => {
		console.log("App is still running...");
	}, 60000); // Log every minute
}

// Start the app
main().catch(async (error) => {
	console.error("Unexpected error:", error);
	if (queueService) {
		await queueService.close();
	}
	process.exit(1);
});
