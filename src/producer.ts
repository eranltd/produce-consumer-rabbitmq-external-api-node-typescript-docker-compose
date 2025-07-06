import { cities, city } from "./israeliStreets/cities";
import { PublishingService } from "./israeliStreets/PublishService";
import { validateAndAssert } from "./utils/validation";

// Type guard to validate that a string is a valid city name.
function isCity(name: string): name is city {
	// `Object.keys(cities)` returns an array of strings, so we can safely check for inclusion.
	return Object.keys(cities).includes(name);
}

// Main execution
(async () => {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		console.error("Please provide a city name as an argument.");
		process.exit(1);
	}

	const cityNameArg = args[0];

	try {
		// Use the generic utility to validate the input.
		// If it passes, `cityName` is correctly typed as `city`.
		// If it fails, it throws an error which is caught below.
		const cityName = validateAndAssert(
			cityNameArg,
			isCity,
			`The city name "${cityNameArg}" is not a valid city. Please check the available cities.`,
		);

		const publishingService = new PublishingService();
		await publishingService.publishData(cityName);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
})();
