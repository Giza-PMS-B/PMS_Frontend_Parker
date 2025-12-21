
// Interface for a single leaf site (parking location)
// Matches backend Site model
export interface LeafSite {
  Id: string;                // Unique identifier (Guid) - matches backend
  Path: string;              // Site path
  NameEn: string;            // Site name in English
  NameAr: string;            // Site name in Arabic
  PricePerHour: number | null; // Price per hour for this site
  IntegrationCode?: string | null; // Optional integration code
  NumberOfSolts?: number | null;   // Number of available parking slots (typo in backend: Solts)
  IsLeaf: boolean;           // Indicates if this is a leaf site
  ParentId?: string | null;  // Parent site ID (Guid)
}

// Interface for internal use (camelCase for easier frontend usage)
export interface LeafSiteDisplay {
  id: string;
  name: string;
  nameAr: string;
  pricePerHour: number;
  availableSlots: number;
  path?: string;
  integrationCode?: string;
}

// Interface for the API response when fetching leaf sites
export interface LeafSiteResponse {
  success: boolean;     // Indicates if request was successful
  data: LeafSite[];     // Array of leaf sites
  message?: string;     // Optional message from server
}