import { LeafSite, LeafSiteResponse, LeafSiteDisplay } from '../models/leaf-site.model';
import { BookingResponse } from '../models/booking.model';

/**
 * Mock data for testing without backend
 * Set useMockData = true in services to use this data
 */

// Mock leaf sites data (using LeafSiteDisplay for frontend)
export const MOCK_LEAF_SITES: LeafSiteDisplay[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Downtown Parking',
    nameAr: 'موقف وسط المدينة',
    pricePerHour: 10,
    availableSlots: 50,
    path: '/Downtown',
    integrationCode: 'DT001'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Airport Parking',
    nameAr: 'موقف المطار',
    pricePerHour: 15,
    availableSlots: 100,
    path: '/Airport',
    integrationCode: 'AP001'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Mall Parking',
    nameAr: 'موقف المول',
    pricePerHour: 8,
    availableSlots: 200,
    path: '/Mall',
    integrationCode: 'ML001'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Business District',
    nameAr: 'الحي التجاري',
    pricePerHour: 12,
    availableSlots: 75,
    path: '/Business',
    integrationCode: 'BD001'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Stadium Parking',
    nameAr: 'موقف الملعب',
    pricePerHour: 20,
    availableSlots: 300,
    path: '/Stadium',
    integrationCode: 'ST001'
  }
];

// Mock response for getLeafSites
export const MOCK_LEAF_SITES_RESPONSE: LeafSiteResponse = {
  success: true,
  data: [],
  message: 'Sites retrieved successfully (MOCK DATA)'
};

// Function to generate mock booking response
// Returns BookingResponse matching backend Ticket model
export function generateMockBookingResponse(
  bookingData: any
): BookingResponse {
  const ticketId = `${crypto.randomUUID()}`;
  const now = new Date();
  const endTime = new Date(now.getTime() + bookingData.NoOfHours * 60 * 60 * 1000);
  
  return {
    id: ticketId,
    siteName: bookingData.SiteName,
    plateNumber: bookingData.PlateNumber,
    phoneNumber: bookingData.PhoneNumber,
    bookingFrom: now.toISOString(),
    bookingTo: endTime.toISOString(),
    totalPrice: bookingData.TotalPrice,
    siteId: bookingData.SiteId
  };
}
