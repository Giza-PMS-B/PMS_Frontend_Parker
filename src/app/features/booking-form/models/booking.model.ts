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
  ticket?: TicketDetails; // Ticket details if successful
}

// Interface for ticket details
export interface TicketDetails {
  ticket_id: string;      // Unique ticket identifier
  siteName: string;       // Name of the parking site (English)
  siteNameAr: string;     // Name of the parking site (Arabic)
  plateNumber: string;    // Vehicle plate number
  phoneNumber: string;    // User's phone number
  from: string;           // Start date/time (ISO format)
  to: string;             // End date/time (ISO format)
  totalPrice: number;     // Total price in SAR
  hours: number;          // Number of hours booked
  pricePerHour: number;   // Price per hour
  createdAt: string;      // Booking creation timestamp
}

// Interface for price calculation display
export interface PriceCalculation {
  pricePerHour: number; // Price per hour for selected site
  hours: number;        // Selected hours
  totalPrice: number;   // Calculated total (pricePerHour * hours)
}