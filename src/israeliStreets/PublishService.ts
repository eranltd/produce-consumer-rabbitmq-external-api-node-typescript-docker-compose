import { cities, city, enlishNameByCity } from './cities';
import { StreetsService } from './StreetsService';
import  QueueService  from './QueueService';
import { CitiesAPIResponse } from './types/CitiesAPIResponse';

export class PublishingService {
   

    async publishData(streetName: city): Promise<void> {
        try {
            const data : CitiesAPIResponse= await StreetsService.getStreetsInCity(streetName);
            // const englishName = enlishNameByCity[streetName];

            // if (!data || !data.streets || data.streets.length === 0) {
            //     console.error(`No streets found for ${englishName} (${streetName})`);
            //     return;
            // }

            // console.log(`Publishing data for ${englishName} (${streetName}) with ${data.streets.length} streets.`);

            // const {streets} = data;

            // console.log('got answer:', data)
            // await this.queueService.publish(data);

            const queueService = new QueueService('citiesQueue'); //TODO: make it const
            await queueService.connect();
            await queueService.produceMessage(JSON.stringify(data)); //Array<{name, streetId}
            await queueService.close();


            console.log('Data successfully published to the queue.');
        } catch (error) {
            console.error('Failed to publish data:', error);
        }
    }
}