export type CitiesAPIResponse = {
    streets: Array<{
        street_name: string;
        streetId: number;
    }>;
    city: string;
}

type StreetData = { //TODO: maybe fetch this with a seconds API call - as assignment states
    _id: number;
    region_code: number;
    region_name: string;
    city_code: number;
    city_name: string;
    street_code: number;
    street_name: string;
    street_name_status: string;
    official_code: number;
  };