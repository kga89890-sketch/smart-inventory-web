
export interface Material {
  pn_code: string;
  location: string; // "D-1-1-1" 형식
  label_spec: string;
  erp_spec: string;
  match: {
    primary_tokens: string[];
    secondary_tokens: string[];
    erp_tokens: string[];
  };
}

export interface SearchResult {
  matchFound: boolean;
  material?: Material;
  explanation: string;
  recommendations?: string[];
}

export enum AppMode {
  SEARCH = 'search',
  VISION = 'vision',
  INVENTORY = 'inventory',
  MAP = 'map'
}
