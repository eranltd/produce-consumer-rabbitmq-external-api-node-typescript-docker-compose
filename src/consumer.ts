import knex from 'knex';
import CitiesRepository from './israeliStreets/repositories/CitiesRepository';
import  QueueService  from './/israeliStreets/QueueService';
import { CitiesAPIResponse } from './israeliStreets/types/CitiesAPIResponse';

// Initialize Knex with PostgreSQL configuration
const db = knex({ //TODO: move to config file, secrets can't be here!!
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'myuser',
        password: 'mypassword',
        database: 'mydatabase',
    },
});

// Function to check database connection
async function checkDatabaseConnection() {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

let queueService: QueueService

// Main function to keep the app running
async function main() {
    await checkDatabaseConnection();

    console.log('App is running...');
    console.log('Connecting to RabbitMQ...');
    
    const citiesRepository = new CitiesRepository(db, null);
    queueService = new QueueService('citiesQueue'); //TODO: make it const
    await queueService.connect();

    const onMessage = async (message: string) => {

                    console.log('Received message:', message);
                    const trx = crypto.randomUUID(); // Generate a unique transaction ID
                    const data: CitiesAPIResponse = JSON.parse(message);
                    citiesRepository.addCityWithStreets(data)
                }

    setInterval(async () => {
        try {
            await queueService.consumeMessage(onMessage); //Array<{name, streetId}
            //             console.log('Message consumed successfully.');
        } catch (error) {
            console.error('Error consuming message:', error);
        }
    }, 5000); // Call every 5 seconds



    // Simulate an always-running app
    setInterval(() => {
        console.log('App is still running...');
    }, 60000); // Log every minute
}

// Start the app
main().catch((error) => {
    console.error('Unexpected error:', error);
    queueService.close()
    process.exit(1);

});