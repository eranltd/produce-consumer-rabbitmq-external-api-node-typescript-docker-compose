import { DB } from "../DB"

export default class extends DB {
    private readonly _cache
    constructor (db, cache) {
      super(db)
    }
  
    async addCityWithStreets({ city, streets }) {
        const [cityId] = await this.dbConnection()('cities')
            .withSchema('interviewdb')
            .insert({
                city_name: city,
                country: 'Israel',
                population: 0
            })
            .returning('city_id');

        const streetRecords = streets.map(street => ({
            street_id: street.streetId, //may cause problems if streetId is not unique
            street_name: street.street_name,
            type_id: street.typeId || 'Street', // Default to 'Street' if typeId is not provided
            city_id: cityId,
            length_meters: street.lengthMeters || 0,
            speed_limit_kph: street.speedLimitKph || 0,
            is_one_way: street.isOneWay || false
        }));

        await this.dbConnection()('streets')
            .withSchema('interviewdb')
            .insert(streetRecords);

        return cityId;
    }

      

    async getCityByName (cityName, trx) {
        return this.dbConnection(trx)('cities')
            .withSchema('interviewdb')
            .where({ name: cityName })
            .first()
        }}