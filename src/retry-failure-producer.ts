import QueueService from './israeliStreets/QueueService';
import { StreetsService } from './israeliStreets/StreetsService';

import { ConsumeMessage } from 'amqplib';

import { CITIES_QUEUE, ENRICHMENT_FAILURE_QUEUE, ENRICHMENT_DEAD_LETTER_QUEUE } from './config/queues';
const RETRY_STREETS_QUEUE = ENRICHMENT_FAILURE_QUEUE;
const SUCCESS_DESTINATION_QUEUE = CITIES_QUEUE;
/**
 * This consumer listens to the failure queue, attempts to re-process messages,
 * and routes them to the appropriate destination (success or dead-letter).
 */
async function main() {
	console.log('Starting the retry consumer...');

	const sourceQueue = new QueueService(RETRY_STREETS_QUEUE);
	const successQueue = new QueueService(SUCCESS_DESTINATION_QUEUE);

	try {
		// Connect to all necessary queues
		await Promise.all([sourceQueue.connect(), successQueue.connect()]);

		console.log(`Listening for messages on queue: "${RETRY_STREETS_QUEUE}"`);

		const onMessage = async (msg: ConsumeMessage | null) => {
			if (!msg) return;
			const failedItem = JSON.parse(msg.content.toString());
			const { street, city, reason } = failedItem;

			console.log(`Retrying enrichment for street ID ${street.streetId} from city ${city}. Original failure reason: ${reason}`);

			try {
				// Attempt to re-enrich the street data
				const info = await StreetsService.getStreetInfoById(street.streetId);
				const enrichedStreet = { ...street, ...info };

				// On success, create a payload similar to the original producer
				// and send it to the main success queue.
				const successPayload = {
					city: city,
					streets: [enrichedStreet],
				};

				await successQueue.produceMessage(JSON.stringify(successPayload));
				sourceQueue.channel.ack(msg); // Acknowledge message on successful re-enrichment
				console.log(`Successfully re-enriched and published street ID ${street.streetId}.`);
			} catch (retryError) {
				// If the retry fails, move the message to the Dead-Letter Queue (DLQ)
				console.error(
					`Retry failed for street ID ${street.streetId}. Should be Moving to DLQ. New error:`,
					(retryError as Error).message,
				);
			}
		};

		await sourceQueue.consumeMessage(onMessage);
	} catch (error) {
		console.error('An unexpected error occurred in the retry consumer:', error);
		// In a real app, you'd want a more robust shutdown sequence
		await Promise.all([sourceQueue.close(), successQueue.close()]);
		process.exit(1);
	}

	// Keep the service running
	process.on('SIGINT', async () => {
		console.log('Shutting down retry consumer...');
		await Promise.all([sourceQueue.close(), successQueue.close()]);
		process.exit(0);
	});
}

main();