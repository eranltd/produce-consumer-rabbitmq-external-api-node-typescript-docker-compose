import { StreetsService } from './israeliStreets/StreetsService';
import { cities, city, enlishNameByCity } from './israeliStreets/cities';
import { PublishingService } from './israeliStreets/PublishService';

// Main execution
(async () => {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Please provide a street name as an argument.');
        process.exit(1);
    }

    const streetName = args[0] as city;
    if (!Object.keys(cities).includes(streetName)) {
        console.error(`The street name "${streetName}" does not exist in the list of cities.`);
        process.exit(1);
    }


    // const streetName : city = args[0] as city; //bad casting, let's use Typescript Generics instead
    const publishingService = new PublishingService();
    await publishingService.publishData(streetName);
})();


/*
"build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "dev": "NODE_ENV=dev BASTION=true ts-node-dev --respawn -r tsconfig-paths/register src/server.ts | pino-pretty --colorize",
    "start:local": "NODE_ENV=local BASTION=true ts-node-dev --respawn -r tsconfig-paths/register src/server.ts | pino-pretty --colorize",
    "start:dev": "BASTION=true NODE_ENV=dev npm start",
    "start:prod": "BASTION=true NODE_ENV=prod npm start",
    "test": "echo \"Skipping Tests as part of CI\\CD\" && exit 0",
    "blackbox-testing": "vitest",
    "lint": "biome format --fix ./src && biome check --write --diagnostic-level=error ./src",
    "lint-fix": "biome check --write ./src",
    "lint-fix-only-errors": "biome check --write --diagnostic-level=error ./src",
    "format": "biome format --fix ./src",
    "lint-format-fix": "npm run lint-fix-only-errors && npm run format",
    "prepare": "echo \"run commands before CI here\"",
    "shopify:initWebhooks": "NODE_ENV=dev VERSION=1.0.0 PACKAGE_NAME=webhooks node ./integration/shopify/initWebhooks.js",
    "kill:local": "kill -9 $(lsof -i :3000)",
    "debug:prod": "NODE_ENV=prod BASTION=true ts-node-dev --respawn -r tsconfig-paths/register src/server.ts | pino-pretty --colorize"
    */