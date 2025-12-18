import { LeafSite, LeafSiteResponse } from '../models/leaf-site.model';
import { BookingResponse } from '../models/booking.model';

/**
 * Mock data for testing without backend
 * Set useMockData = true in services to use this data
 */

// Mock leaf sites data
export const MOCK_LEAF_SITES: LeafSite[] = [
  {
    id: 1,
    name: 'Downtown Parking',
    pricePerHour: 10,
    availableSlots: 50,
    location: 'Downtown District',
    description: 'Central location near shopping centers'
  },
  {
    id: 2,
    name: 'Airport Parking',
    pricePerHour: 15,
    availableSlots: 100,
    location: 'King Khalid International Airport',
    description: 'Convenient parking near all terminals'
  },
  {
    id: 3,
    name: 'Mall Parking',
    pricePerHour: 8,
    availableSlots: 200,
    location: 'Riyadh Park Mall',
    description: 'Covered parking with direct mall access'
  },
  {
    id: 4,
    name: 'Business District',
    pricePerHour: 12,
    availableSlots: 75,
    location: 'King Abdullah Financial District',
    description: 'Premium parking for business professionals'
  },
  {
    id: 5,
    name: 'Stadium Parking',
    pricePerHour: 20,
    availableSlots: 300,
    location: 'King Fahd International Stadium',
    description: 'Large capacity parking for events'
  }
];

// Mock response for getLeafSites
export const MOCK_LEAF_SITES_RESPONSE: LeafSiteResponse = {
  success: true,
  data: MOCK_LEAF_SITES,
  message: 'Sites retrieved successfully (MOCK DATA)'
};

// Function to generate mock booking response
export function generateMockBookingResponse(
  success: boolean = true,
  bookingData?: any
): BookingResponse {
  if (success && bookingData) {
    const bookingId = `BK-${new Date().getFullYear()}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
    const now = new Date();
    const endTime = new Date(now.getTime() + bookingData.hours * 60 * 60 * 1000);
    
    // Find the site name from mock data
    const site = MOCK_LEAF_SITES.find(s => s.id === bookingData.siteId);
    
    return {
      success: true,
      bookingId: bookingId,
      message: 'Booking created successfully',
      ticket: {
        ticket_id: bookingId,
        siteName: site?.name || 'Unknown Site',
        plateNumber: bookingData.plateNumber,
        phoneNumber: bookingData.phoneNumber,
        from: now.toISOString(),
        to: endTime.toISOString(),
        totalPrice: bookingData.totalPrice,
        hours: bookingData.hours,
        pricePerHour: site?.pricePerHour || 0,
        createdAt: now.toISOString()
      }
    };
  } else {
    return {
      success: false,
      message: 'Booking failed',
      errors: ['This is a simulated error for testing']
    };
  }
}
