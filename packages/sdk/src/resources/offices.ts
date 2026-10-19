import { BaseResource } from "./base";
import { ENDPOINTS } from "../constants";
import {
  GetOfficesRequest,
  GetOfficesResponse,
  Office,
  City,
  Country,
  Street,
  GetStreetsRequest,
  GetStreetsResponse,
  Quarter,
  GetQuartersRequest,
  GetQuartersResponse,
} from "@alphabite/econt-types";
import { parseInput } from "../utils/validation";

/**
 * Offices resource - handles office-related operations
 */
export class Offices extends BaseResource {
  /**
   * Get list of Econt offices
   * At least one filter is required to prevent huge responses
   */
  async list(input: GetOfficesRequest): Promise<Office[]> {
    if (!input.countryCode && !input.cityId && !input.officeCode) {
      throw new Error("At least one filter (countryCode, cityId, or officeCode) is required to fetch offices");
    }

    const requestParams: GetOfficesRequest = parseInput(input, "cityId");

    const response = await this.http.post<GetOfficesResponse>(ENDPOINTS.offices, requestParams);
    return response.offices || [];
  }

  /**
   * Get a specific office by code
   */
  async get(officeCode: string): Promise<Office | null> {
    const offices = await this.list({ officeCode });
    return offices.length > 0 ? offices[0] : null;
  }

  /**
   * Get offices in a specific city
   */
  async getByCity(cityId: string | number): Promise<Office[]> {
    return this.list({ cityId } as GetOfficesRequest);
  }

  /**
   * Get offices in a specific country
   */
  async getByCountry(countryCode: string): Promise<Office[]> {
    return this.list({ countryCode });
  }

  /**
   * Get list of cities
   * countryCode is required to prevent huge responses
   */
  async getCities(params: { countryCode: string; cityId?: string | number }): Promise<City[]> {
    const requestParams = parseInput({ countryCode: params.countryCode, cityId: params.cityId }, "cityId");
    const response = await this.http.post<{ cities: City[] }>(ENDPOINTS.cities, requestParams);
    return response.cities || [];
  }

  /**
   * Get list of countries
   * This endpoint returns all countries (~236) which is manageable
   */
  async getCountries(): Promise<Country[]> {
    const response = await this.http.post<{ countries: Country[] }>(ENDPOINTS.countries, {});
    return response.countries || [];
  }

  /**
   * Search for streets in a city
   */
  async getStreets(input: GetStreetsRequest): Promise<Street[]> {
    const requestParams: GetStreetsRequest = parseInput(input, "cityID");
    const response = await this.http.post<GetStreetsResponse>(ENDPOINTS.streets, requestParams);
    return response.streets || [];
  }

  /**
   * Get quarters (neighborhoods) in a city
   */
  async getQuarters(input: GetQuartersRequest): Promise<Quarter[]> {
    const requestParams: GetQuartersRequest = parseInput(input, "cityID");
    const response = await this.http.post<GetQuartersResponse>(ENDPOINTS.quarters, requestParams);
    return response.quarters || [];
  }
}
