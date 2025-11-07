// Backend filter structure
export interface FilterOption {
  id: number;
  rrr_id: string | number;
  name: string;
  languages?: Record<string, string>;
}

export interface Category {
  id: number;
  rrr_id: string | number;
  name: string;
  parent_id: string | number;
  level: number;
  languages: {
    id: string;
    parent_id: string;
    level: string;
    [key: string]: string; // Language codes like "en", "lv", "ru", etc.
  };
  subcategories: Category[];
}

export interface FilterCategory {
  [key: string]: FilterOption[];
}

export interface CarFiltersResponse {
  wheels?: {
    wheels?: FilterOption[];
    wheel_drives?: FilterOption[];
    wheels_fixing_points?: FilterOption[];
    wheels_spacing?: FilterOption[];
    wheels_central_diameter?: FilterOption[];
    wheels_width?: FilterOption[];
    wheels_height?: FilterOption[];
    wheels_tread_depth?: FilterOption[];
  };
  categories?: Category[];
  [key: string]: FilterCategory | Category[] | undefined;
}

export type CarFilters = CarFiltersResponse;
