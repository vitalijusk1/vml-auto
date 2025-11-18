// Backend filter structure types
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

// Backend filters response structure - includes car, parts, wheels, and categories
export interface BackendFilters {
  car?: {
    brands?: (string | FilterOption)[];
    models?: (string | FilterOption)[];
    car_models?: (string | FilterOption)[];
    body_types?: (string | FilterOption)[];
    fuel_types?: (string | FilterOption)[];
    fuels?: (string | FilterOption)[];
  };
  parts?: {
    statuses?: (string | FilterOption)[];
    qualities?: (string | FilterOption)[];
    positions?: (string | FilterOption)[];
  };
  wheels?: {
    wheels?: (string | FilterOption)[];
    drives?: (string | FilterOption)[];
    wheel_drives?: (string | FilterOption)[];
    fixing_points?: (string | FilterOption)[];
    wheels_fixing_points?: (string | FilterOption)[];
    spacing?: (string | FilterOption)[];
    wheels_spacing?: (string | FilterOption)[];
    central_diameter?: (string | FilterOption)[];
    wheels_central_diameter?: (string | FilterOption)[];
    width?: (string | FilterOption)[];
    wheels_width?: (string | FilterOption)[];
    height?: (string | FilterOption)[];
    wheels_height?: (string | FilterOption)[];
    tread_depth?: (string | FilterOption)[];
    wheels_tread_depth?: (string | FilterOption)[];
  };
  categories?: Category[];
}
