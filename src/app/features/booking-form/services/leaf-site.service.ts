
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, asyncScheduler } from 'rxjs';
import { map, observeOn } from 'rxjs/operators';
import { LeafSite, LeafSiteResponse } from '../models/leaf-site.model';
import { environment } from '../../../../environments/environment';
import { MOCK_LEAF_SITES_RESPONSE, MOCK_LEAF_SITES } from './mock-data';

@Injectable({
  providedIn: 'root' // Service is available application-wide
})
export class LeafSiteService {
  // Base URL from environment configuration
  private apiUrl = environment.apiUrl;

  // Toggle between mock data and real API
  // Set to true to use mock data, false to use real backend
  private useMockData = true; // ← Change this to false when backend is ready

  constructor(private http: HttpClient) { }

  /**
   * Fetches all leaf sites from backend or mock data
   * GET request to /getleafsites endpoint
   */
  getLeafSites(): Observable<LeafSite[]> {
    if (this.useMockData) {
      // Return mock data immediately
      return of(MOCK_LEAF_SITES);
    }

    // Real API call
    return this.http.get<LeafSiteResponse>(`${this.apiUrl}/getleafsites`)
      .pipe(
        map(response => {
          // Check if request was successful
          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch sites');
          }
          return response.data; // Return array of leaf sites
        })
      );
  }

  /**
   * Fetches a specific leaf site by ID
   * Useful for getting price per hour for a selected site
   */
  getSiteById(id: number): Observable<LeafSite> {
    if (this.useMockData) {
      // Return mock data
      console.log(`🔧 Using MOCK data for site ID: ${id}`);
      const site = MOCK_LEAF_SITES.find(s => s.id === id);
      if (!site) {
        throw new Error(`Site with ID ${id} not found`);
      }
      return of(site).pipe(delay(300));
    }

    // Real API call
    return this.http.get<LeafSite>(`${this.apiUrl}/leafsites/${id}`);
  }
}