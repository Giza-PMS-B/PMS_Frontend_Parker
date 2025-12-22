// Interface for booking request data sent to backend
// Matches CreateTicketDTO from backend
export interface BookingRequest {
  SiteName: string; // Name of the parking site
  PlateNumber: string; // Vehicle plate number
  PhoneNumber: string; // User's phone number
  TotalPrice: number; // Calculated total price
  SiteId: string; // ID of selected leaf site (Guid)
  NoOfHours: number; // Number of hours to reserve
}

// Interface for booking response from backend
// Matches Ticket model from backend
export interface BookingResponse {
  id: string; // Unique ticket identifier (Guid)
  siteName: string; // Name of the parking site
  plateNumber: string; // Vehicle plate number
  phoneNumber: string; // User's phone number
  bookingFrom: string; // Start date/time (ISO format)
  bookingTo: string; // End date/time (ISO format)
  totalPrice: number; // Total price in SAR
  siteId: string; // Site ID (Guid)
}

// Interface for ticket details (used internally in frontend)
export interface TicketDetails {
  ticket_id: string; // Unique ticket identifier
  siteName: string; // Name of the parking site (English)
  siteNameAr: string; // Name of the parking site (Arabic)
  plateNumber: string; // Vehicle plate number
  phoneNumber: string; // User's phone number
  from: string; // Start date/time (ISO format)
  to: string; // End date/time (ISO format)
  totalPrice: number; // Total price in SAR
  hours: number; // Number of hours booked
  pricePerHour: number; // Price per hour
  createdAt: string; // Booking creation timestamp
}

// Interface for price calculation display
export interface PriceCalculation {
  pricePerHour: number; // Price per hour for selected site
  hours: number; // Selected hours
  totalPrice: number; // Calculated total (pricePerHour * hours)
}
