import authInstance from "./axios";
import { apiEndpoints } from "./routes/routes";
import { Part, PartStatus } from "@/types";
import { Category } from "@/utils/backendFilters";

// API Response types for preorder analysis
export interface PreorderAnalysisPart {
  name: string;
  manufactories_id: string;
  part_list: number[];
  items: number;
  sold: number;
  in_stock: number;
  statuses: {
    available: number;
    reserved: number;
    sold: number;
  };
  value: number;
  profit: number;
  avg_price: number;
  avg_profit: number;
  avg_days_to_sell: number;
}

export interface PreorderAnalysisCategory {
  cat_id: string;
  cat_name: string;
  level: number;
  parent_id: string;
  parts: PreorderAnalysisPart[];
  totals: {
    items: number;
    sold: number;
    in_stock: number;
    statuses: {
      available: number;
      reserved: number;
      sold: number;
    };
    value: number;
    profit: number;
    avg_price: number;
    avg_profit: number;
    avg_days_to_sell: number;
  };
  sub_cat: Record<string, PreorderAnalysisCategory>;
}

export interface PreorderAnalysisResponse {
  success: boolean;
  data: Record<string, PreorderAnalysisCategory>;
  filter_data: {
    brand: string;
    brand_id: number;
    model: string;
    model_id: number;
    year: string;
    fuel_id: string;
    engine_volume: string | null;
    date_from: string;
    date_to: string;
  };
}

export interface PreorderAnalysisParams {
  brand_id?: number | string;
  model_id?: number | string;
  year?: number;
  fuel_id?: number | string;
  engine_volume?: string;
  engine_volume_min?: number;
  engine_volume_max?: number;
  date_from?: string;
  date_to?: string;
}

// Transform API category to Category format
function transformCategory(apiCategory: PreorderAnalysisCategory): Category {
  const subcategories: Category[] = [];

  // Transform subcategories
  if (apiCategory.sub_cat && Object.keys(apiCategory.sub_cat).length > 0) {
    Object.values(apiCategory.sub_cat).forEach((subCat) => {
      subcategories.push(transformCategory(subCat));
    });
  }

  return {
    id: parseInt(apiCategory.cat_id),
    rrr_id: apiCategory.cat_id,
    name: apiCategory.cat_name,
    parent_id: apiCategory.parent_id,
    level: apiCategory.level,
    languages: {
      id: apiCategory.cat_id,
      parent_id: apiCategory.parent_id,
      level: apiCategory.level.toString(),
      en: apiCategory.cat_name, // Default to English, can be localized later
      lt: apiCategory.cat_name, // Default to Lithuanian
    },
    subcategories,
  };
}

// Transform API part to Part format
// The API groups parts by manufacturer code, so we create one Part entry per group
function transformPart(
  apiPart: PreorderAnalysisPart,
  categoryName: string,
  carId: string,
  carBrand: string,
  carModel: string,
  carYear: number
): Part[] {
  const parts: Part[] = [];

  // Determine status based on in_stock and sold
  // If there are items in stock, at least one is "In Stock"
  // If there are reserved items, at least one is "Reserved"
  // Otherwise, if all are sold, status is "Sold"
  let status: PartStatus = "In Stock";
  if (apiPart.in_stock === 0 && apiPart.sold > 0) {
    status = "Sold";
  } else if (apiPart.statuses.reserved > 0) {
    status = "Reserved";
  }

  // Create one Part entry per item in part_list
  // Each item in part_list represents an individual part with this manufacturer code
  // The API groups parts by manufacturer code, so we distribute statuses across the items
  apiPart.part_list.forEach((partId, index) => {
    // Determine individual part status based on position in the list
    // We assume: first items are available, then reserved, then sold
    let partStatus: PartStatus = "In Stock";
    let statusId = 0;
    const availableCount = apiPart.statuses.available || 0;
    const reservedCount = apiPart.statuses.reserved || 0;
    const soldCount = apiPart.statuses.sold || 0;

    if (index < availableCount) {
      partStatus = "In Stock";
      statusId = 0;
    } else if (index < availableCount + reservedCount) {
      partStatus = "Reserved";
      statusId = 1;
    } else if (index < availableCount + reservedCount + soldCount) {
      partStatus = "Sold";
      statusId = 2;
    } else {
      // Fallback to group status
      partStatus = status;
      if (status === "Sold") statusId = 2;
      else if (status === "Reserved") statusId = 1;
      else statusId = 0;
    }

    parts.push({
      id: partId.toString(),
      code: partId.toString(),
      name: apiPart.name,
      category: categoryName,
      partType: "",
      carId: carId,
      carBrand: carBrand,
      carModel: carModel,
      carYear: carYear,
      manufacturerCode: apiPart.manufactories_id,
      status: partStatus,
      statusId: statusId,
      priceEUR: apiPart.avg_price || 0,
      pricePLN: (apiPart.avg_price || 0) * 4.5, // Approximate conversion
      daysInInventory: apiPart.avg_days_to_sell || 0,
      dateAdded: new Date().toISOString(),
      photos: [],
      warehouse: undefined,
      analysisStatusCounts: {
        available: apiPart.statuses.available || 0,
        reserved: apiPart.statuses.reserved || 0,
        sold: apiPart.statuses.sold || 0,
      },
    });
  });

  return parts;
}

// Recursively collect all parts from categories
function collectPartsFromCategory(
  apiCategory: PreorderAnalysisCategory,
  categoryName: string,
  carId: string,
  carBrand: string,
  carModel: string,
  carYear: number,
  allParts: Part[]
): void {
  // Add parts from this category
  apiCategory.parts.forEach((apiPart) => {
    const transformedParts = transformPart(
      apiPart,
      categoryName,
      carId,
      carBrand,
      carModel,
      carYear
    );
    allParts.push(...transformedParts);
  });

  // Recursively process subcategories
  if (apiCategory.sub_cat && Object.keys(apiCategory.sub_cat).length > 0) {
    Object.values(apiCategory.sub_cat).forEach((subCat) => {
      collectPartsFromCategory(
        subCat,
        subCat.cat_name,
        carId,
        carBrand,
        carModel,
        carYear,
        allParts
      );
    });
  }
}

// Get preorder analysis data
export const getPreorderAnalysis = async (
  params: PreorderAnalysisParams
): Promise<{
  categories: Category[];
  parts: Part[];
  filterData: PreorderAnalysisResponse["filter_data"];
}> => {
  const response = await authInstance.get<PreorderAnalysisResponse>(
    apiEndpoints.getPreorderAnalysis(params)
  );

  const categories: Category[] = [];
  const allParts: Part[] = [];

  // Extract car info from filter_data
  const carId = params.model_id?.toString() || "";
  const carBrand = response.data.filter_data?.brand || "";
  const carModel = response.data.filter_data?.model || "";
  const carYear = parseInt(response.data.filter_data?.year || "0");

  // Transform each top-level category
  Object.values(response.data.data).forEach((apiCategory) => {
    const category = transformCategory(apiCategory);
    categories.push(category);

    // Collect all parts from this category tree
    collectPartsFromCategory(
      apiCategory,
      apiCategory.cat_name,
      carId,
      carBrand,
      carModel,
      carYear,
      allParts
    );
  });

  return {
    categories,
    parts: allParts,
    filterData: response.data.filter_data,
  };
};
