
// Interface for a single leaf site (parking location)
export interface LeafSite {
  id: number;           // Unique identifier for the site
  name: string;         // Site name displayed in dropdown
  pricePerHour: number; // Price per hour for this site
  availableSlots: number; // Number of available parking slots
  location?: string;    // Optional: physical location
  description?: string; // Optional: additional details
}

// Interface for the API response when fetching leaf sites
export interface LeafSiteResponse {
  success: boolean;     // Indicates if request was successful
  data: LeafSite[];     // Array of leaf sites
  message?: string;     // Optional message from server
}