// Interface for booking request data sent to backend
export interface BookingRequest {
  siteId: number;       // ID of selected leaf site
  plateNumber: string;  // Vehicle plate number
  phoneNumber: string;  // User's phone number
  hours: number;        // Number of hours to reserve
  totalPrice: number;   // Calculated total price
}

// Interface for booking response from backend
export interface BookingResponse {
  success: boolean;     // Indicates if booking was successful
  bookingId?: string;   // Generated booking ID if successful
  message?: string;     // Response message
  errors?: string[];    // Validation errors if any
}

// Interface for price calculation display
export interface PriceCalculation {
  pricePerHour: number; // Price per hour for selected site
  hours: number;        // Selected hours
  totalPrice: number;   // Calculated total (pricePerHour * hours)
}