import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, asyncScheduler } from 'rxjs';
import { map, observeOn } from 'rxjs/operators';
import { LeafSite, LeafSiteResponse, LeafSiteDisplay } from '../models/leaf-site.model';
import { environment } from '../../../../environments/environment';
import { MOCK_LEAF_SITES_RESPONSE, MOCK_LEAF_SITES } from './mock-data';

@Injectable({
  providedIn: 'root', // Service is available application-wide
})
export class LeafSiteService {
  // Base URL from environment configuration
  private apiUrl = environment.apiUrl;

  // Toggle between mock data and real API
  // Set to true to use mock data, false to use real backend
  private useMockData = false; // ← Change this to false when backend is ready

  constructor(private http: HttpClient) {}

  /**
   * Fetches all leaf sites from backend or mock data
   * GET request to /api/Site/leaves endpoint
   */
  getLeafSites(): Observable<LeafSiteDisplay[]> {
    if (this.useMockData) {
      // Return mock data immediately
      return of(MOCK_LEAF_SITES);
    }

    console.log(`Fetching data from site service${this.apiUrl}/Site/leaves`);
    // Real API call - backend returns array directly
    return this.http.get<LeafSite[]>(`${this.apiUrl}/Site/leaves`).pipe(
      map((sites) => {
        // Transform backend Site model to frontend LeafSiteDisplay
        console.log('Raw API response:', sites);
        console.log('First site structure:', sites[0]);
        console.log('Site properties:', sites[0] ? Object.keys(sites[0]) : 'No sites');
        
        let test_sites = sites.map((site) => this.transformToDisplay(site));
        console.log('Transformed sites:', test_sites);
        return test_sites;
      })
    );
  }

  /**
   * Fetches a specific leaf site by ID
   * Useful for getting price per hour for a selected site
   */
  getSiteById(id: string): Observable<LeafSiteDisplay> {
    if (this.useMockData) {
      // Return mock data
      console.log(`🔧 Using MOCK data for site ID: ${id}`);
      const site = MOCK_LEAF_SITES.find((s) => s.id === id);
      if (!site) {
        throw new Error(`Site with ID ${id} not found`);
      }
      return of(site).pipe(delay(300));
    }

    // Real API call
    return this.http
      .get<LeafSite>(`${this.apiUrl}/Site/${id}`)
      .pipe(map((site) => this.transformToDisplay(site)));
  }

  /**
   * Transform backend Site model to frontend LeafSiteDisplay
   * Handles different property name formats from backend
   */
  private transformToDisplay(site: any): LeafSiteDisplay {
    // Log the actual site object to debug
    console.log('Transforming site:', site);
    
    return {
      id: site.Id || site.id || '',
      name: site.NameEn || site.nameEn || site.name || '',
      nameAr: site.NameAr || site.nameAr || site.name_ar || '',
      pricePerHour: site.PricePerHour || site.pricePerHour || site.price_per_hour || 0,
      availableSlots: site.NumberOfSolts || site.numberOfSolts || site.number_of_slots || site.availableSlots || 0,
      path: site.Path || site.path || '',
      integrationCode: site.IntegrationCode || site.integrationCode || site.integration_code || undefined,
    };
  }
}
