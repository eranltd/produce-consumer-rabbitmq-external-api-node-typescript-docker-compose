import { DB } from "../DB"

export default class extends DB {
    private readonly _cache
    constructor (db, cache) {
      super(db)
    }
  
    async addCityWithStreets({ city, streets }) { //todo covert street or city name to english
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
                        population: 0
                    })
                    .returning('city_id');
                console.log('City added with ID:', cityId);
            }

            console.log('City added with ID:', cityId);

        const streetRecords : Array<Record<string,string>>= streets.map(street => ({
            city_id: cityId, // Foreign key reference to the city
            street_id: street.streetId, //may cause problems if streetId is not unique
            street_name: street.name || 'not-available', // Default to 'not-available' if name is not provided
        }));


        //TODO: insert transaction wrapper, and insert in batches

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