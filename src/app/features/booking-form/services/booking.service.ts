import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/booking.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:5001/api/Booking';

  constructor(private http: HttpClient) {}

  /**
   * Submits booking data to backend
   * POST request to booking endpoint
   */
  createBooking(bookingData: BookingRequest): Observable<BookingResponse> {
    // Real API call
    return this.http
      .post<BookingResponse>(this.apiUrl, bookingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap({
          next: (res) => console.log('Booking response:', res),
          error: (err) => console.error('Booking error:', err),
        })
      );
  }
}
