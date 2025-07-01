import { Street } from "../StreetsService";

export type CitiesAPIResponse = {
    streets: Array<Street & {name: string}>;
    city: string;
}
