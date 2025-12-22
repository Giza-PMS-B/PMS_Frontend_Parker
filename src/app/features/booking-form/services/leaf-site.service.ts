import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, timeout, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LeafSite, LeafSiteDisplay } from '../models/leaf-site.model';
import { environment } from '../../../../environments/environment';
import { MOCK_LEAF_SITES } from './mock-data';

@Injectable({
  providedIn: 'root', // Service is available application-wide
})
export class LeafSiteService {
  // Base URL from environment configuration
  private apiUrl = environment.apiUrl;

  // Toggle between mock data and real API
  // Set to true to use mock data, false to use real backend
  private useMockData = false; // ← Back to using real API

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

    console.log(`Fetching data from site service: ${this.apiUrl}/Site/leaves`);
    // Real API call - backend returns array directly
    return this.http.get<LeafSite[]>(`${this.apiUrl}/Site/leaves`).pipe(
      timeout(10000), // 10 second timeout
      map((sites) => {
        console.log('Raw API response:', sites);
        
        // Check if sites is an array
        if (!Array.isArray(sites)) {
          console.error('Expected array but got:', typeof sites, sites);
          throw new Error('Invalid response format: expected array');
        }
        
        console.log('Number of sites received:', sites.length);
        if (sites.length > 0) {
          console.log('First site structure:', sites[0]);
          console.log('Site properties:', Object.keys(sites[0]));
        }
        
        // Transform backend Site model to frontend LeafSiteDisplay
        const transformedSites = sites.map((site, index) => {
          try {
            return this.transformToDisplay(site);
          } catch (error) {
            console.error(`Error transforming site at index ${index}:`, error, site);
            throw error;
          }
        });
        
        console.log('Successfully transformed sites:', transformedSites.length);
        console.log('Transformed sites:', transformedSites);
        return transformedSites;
      }),
      catchError((error) => {
        console.error('HTTP Error in getLeafSites:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error object:', error);
        
        // Return empty array on error so the UI doesn't break
        // The component will handle the error through the error callback
        throw error;
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
    console.log('=== Transforming individual site ===');
    console.log('Original site object:', site);
    console.log('Available properties:', Object.keys(site));
    
    // Log each property value for debugging
    Object.keys(site).forEach(key => {
      console.log(`${key}:`, site[key]);
    });
    
    const transformed = {
      id: site.Id || site.id || '',
      name: site.NameEn || site.nameEn || site.name || '',
      nameAr: site.NameAr || site.nameAr || site.name_ar || '',
      pricePerHour: site.PricePerHour || site.pricePerHour || site.price_per_hour || 0,
      availableSlots: site.NumberOfSolts || site.numberOfSolts || site.number_of_slots || site.availableSlots || 0,
      path: site.Path || site.path || '',
      integrationCode: site.IntegrationCode || site.integrationCode || site.integration_code || undefined,
    };
    
    console.log('Transformed result:', transformed);
    console.log('=== End transformation ===');
    
    return transformed;
  }
}
