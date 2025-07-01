import { cities, city, enlishNameByCity } from './cities';
import { StreetsService } from './StreetsService';
import  QueueService  from './QueueService';
import { CitiesAPIResponse } from './types/CitiesAPIResponse';

export class PublishingService {
   

    async publishData(streetName: city): Promise<void> {
        try {
            const data = await StreetsService.getStreetsInCity(streetName);

            if (data && data.streets && data.streets.length > 0) {
                const enrichedStreets = await Promise.all(
                    data.streets.map(async street => {
                        try {
                            const info = await StreetsService.getStreetInfoById(street.streetId);
                            for (const key in info) { //trim all string fields
                                if (typeof info[key] === 'string') {
                                    info[key] = info[key].trim();
                                }
                            }

                            for (const key in street) { //trim all string fields
                                if (typeof street[key] === 'string') {
                                    street[key] = street[key].trim();
                                }
                            }
                            return {
                                ...street,
                                ...info
                            };
                        } catch (error) {
                            console.error(`Failed to enrich street with ID ${street.streetId}:`, error);
                            return street; // Return original street data if enrichment fails
                        }
                    })
                );
                data.streets = enrichedStreets;
            }




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