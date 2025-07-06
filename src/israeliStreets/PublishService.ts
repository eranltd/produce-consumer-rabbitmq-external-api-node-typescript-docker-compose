import { city } from './cities';
import { StreetsService } from './StreetsService';
import QueueService from './QueueService';
import { CITIES_QUEUE, CONSUMER_DEAD_LETTER_QUEUE, ENRICHMENT_FAILURE_QUEUE } from '../config/queues';

export class PublishingService {
	async publishData(cityName: city): Promise<void> {
		const successQueue = new QueueService(CITIES_QUEUE);
		const failureQueue = new QueueService(ENRICHMENT_FAILURE_QUEUE);

		await Promise.all([successQueue.connect(), failureQueue.connect()]);
			
		try {
			console.log(`Fetching street data for ${cityName}...`);
			const data = await StreetsService.getStreetsInCity(cityName);

			if (!data || !data.streets || data.streets.length === 0) {
				// If no streets are found, this is a valid case, but we should not proceed.
				console.log(`No streets found for city: ${cityName}. Nothing to publish.`);
				return;
			}

			console.log(`Enriching data for ${data.streets.length} streets...`);
			const enrichmentPromises = data.streets.map((street) => {
				// The enrichment logic is wrapped in a self-invoking async function
				// to be used with Promise.allSettled.
				return (async () => {
					const info = await StreetsService.getStreetInfoById(street.streetId);
					return { ...street, ...info };
				})();
			});

			const results = await Promise.allSettled(enrichmentPromises);

			const enrichedStreets: unknown[] = [];
			const failedEnrichments: unknown[] = [];

			results.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					enrichedStreets.push(result.value);
				} else {
					const originalStreet = data.streets[index];
					console.error(
						`Failed to enrich street with ID ${originalStreet.streetId}. It will be sent to the failure queue. Error:`,
						(result.reason as Error).message,
					);
					failedEnrichments.push({
						street: originalStreet,
						city: cityName,
						reason: (result.reason as Error).message,
						timestamp: new Date().toISOString(),
					});
				}
			});

			

			// Handle failures by publishing them to a separate queue for later inspection or reprocessing.
			if (failedEnrichments.length > 0) {
				console.log(`Publishing ${failedEnrichments.length} failed streets enrichments to the failure queue...`);
				const failurePromises = failedEnrichments.map((failure) =>
					failureQueue.produceMessage(JSON.stringify(failure)),
				);
				await Promise.all(failurePromises);
			}

			// Handle successfully enriched streets.
			if (enrichedStreets.length > 0) {
				const payload = {
					...data,
					streets: enrichedStreets,
				};
				await successQueue.produceMessage(JSON.stringify(payload));
				console.log(`${enrichedStreets.length} streets successfully published to the queue for city ${cityName}.`);
			} else {
				console.log('No streets were successfully enriched. Nothing to publish to the main queue.');
			}
		} catch (error) {
			console.error(`Failed to publish data for city ${cityName}:`, error);
			throw error;
		} finally {
			// Ensure all queue connections are closed, regardless of success or failure.
			await Promise.all([successQueue.close(), failureQueue.close()]);
		}
	}
}
