import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/booking.model';
import { environment } from '../../../../environments/environment';
import { generateMockBookingResponse } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:5001/api/Booking';

  // Toggle between mock data and real API
  // Set to true to use mock data, false to use real backend
  private useMockData = false; // ← Change this to false when backend is ready

  constructor(private http: HttpClient) {}

  /**
   * Submits booking data to backend or returns mock response
   * POST request to booking endpoint
   */
  createBooking(bookingData: BookingRequest): Observable<BookingResponse> {
    if (this.useMockData) {
      // Return mock response immediately
      return of(generateMockBookingResponse(bookingData));
    }

    // Real API call
    return this.http.post<BookingResponse>(`${this.apiUrl}`, bookingData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
