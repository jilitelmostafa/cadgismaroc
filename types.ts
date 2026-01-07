
export interface ProvinceData {
  nomFr: string;
  nomAr: string;
  region: string;
  downloadUrl: string | null;
}

export type BaseMapType = 'OSM' | 'Satellite' | 'Terrain';

export interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}
