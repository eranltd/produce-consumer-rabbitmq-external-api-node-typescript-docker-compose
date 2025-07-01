import { DB } from "../DB"
import { Street } from "../StreetsService";

export default class extends DB {
    private readonly _cache
    constructor (db, cache) {
      super(db)
    }
  
    async addCityWithStreets({ city, streets }:{city:string, streets: Array<Street & {name:string}>}) { //todo covert street or city name to english
        try{
            let cityId;

            const existingCity = await this.dbConnection()('cities')
                .withSchema('interviewdb')
                .where({ city_name: city })
                .first();

            if (existingCity) {
                cityId = existingCity.city_id;
                console.log('City already exists with ID:', cityId);
            } else {
                [cityId] = await this.dbConnection()('cities')
                    .withSchema('interviewdb')
                    .insert({
                        city_name: city,
                        country: 'Israel',
                        population: 0,
                    })
                    .returning('city_id');
                console.log('City added with ID:', cityId);
            }

            console.log('City added with ID:', cityId);

        const streetRecords = streets.map(street => ({
            city_id: cityId, // Foreign key reference to the city
            city_code: street.city_code,
            street_id: street.streetId, //may cause problems if streetId is not unique
            street_name: street.name || street.street_name || '',
            official_code: street.official_code || 0, // Default to 0 if official_code is not provided
            region_code: street.region_code || 0, // Default to 0 if region_code is not provided
            region_name: street.region_name || '',
            street_code: street.street_code || 0, // Default to 0 if street_code is not provided
            street_name_status: street.street_name_status || '',
        }));


        //TODO: insert transaction wrapper, and insert in batches, kept things like that for simplicity

        const existingStreets= streetRecords

        await this.dbConnection()('streets')
            .withSchema('interviewdb')
            .insert(existingStreets);
            
            console.log('Streets added for city ID:', cityId);

        return cityId;
        } catch (error) {
            console.error('Error adding city with streets:', error);
            // throw error; // Re-throw the error to handle it in the calling function 
        }
    }
        

      

    async getCityByName (cityName, trx) {
        return this.dbConnection(trx)('cities')
            .withSchema('interviewdb')
            .where({ name: cityName })
            .first()
        }}