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
    queueService = new QueueService('citiesQueue');
    await queueService.connect();

    const onMessage = async (message: string) => {

                    const data: CitiesAPIResponse = JSON.parse(message);
                    await citiesRepository.addCityWithStreets(data)
                }

    setInterval(async () => {
        try {
            await queueService.consumeMessage(onMessage); //Array<{name, streetId} //TODO: inside consumeMessage, check connection status make a fail safe mechanism to connect on failure 
            //             console.log('Message consumed successfully.');
        } catch (error) {
            console.error('Error consuming message:', error);
        }
    }, 5000); // Call every 5 seconds



    //Simulate an always-running app
    setInterval(() => {
        console.log('App is still running...');
    }, 60000); // Log every minute
}

// Start the app
main().catch(async (error) => {
    console.error('Unexpected error:', error);
    await queueService.close()
    process.exit(1);

});