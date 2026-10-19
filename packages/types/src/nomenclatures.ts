/**
 * Nomenclatures types - Street, Quarter, etc.
 */

export interface Street {
  id?: number;
  cityID?: number;
  name?: string;
  nameEn?: string;
}

export interface Quarter {
  id?: number;
  cityID?: number;
  name?: string;
  nameEn?: string;
}

export interface GetStreetsRequest {
  cityID?: string | number;
  streetName?: string;
}

export interface GetStreetsResponse {
  streets?: Street[];
}

export interface GetQuartersRequest {
  cityID?: string | number;
}

export interface GetQuartersResponse {
  quarters?: Quarter[];
}
