import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LeafSiteService } from './services/leaf-site.service';
import { BookingService } from './services/booking.service';
import { CustomValidators } from './validators/custom.validators';
import { LeafSite, LeafSiteDisplay } from './models/leaf-site.model';
import { BookingRequest, PriceCalculation, TicketDetails } from './models/booking.model';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  leafSites: LeafSiteDisplay[] = [];
  priceCalculation: PriceCalculation = {
    pricePerHour: 0,
    hours: 1,
    totalPrice: 0
  };
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  loadingSites = true;
  
  // Show mock data indicator (check if services are using mock data)
  get isUsingMockData(): boolean {
    return (this.leafSiteService as any).useMockData || (this.bookingService as any).useMockData;
  }

  constructor(
    private fb: FormBuilder,
    private leafSiteService: LeafSiteService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router,
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadLeafSites();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      siteId: ['', Validators.required],
      plateNumber: ['', [Validators.required, CustomValidators.plateNumber()]],
      phoneNumber: ['', [Validators.required, CustomValidators.saudiPhoneNumber()]],
      hours: [1, [Validators.required, Validators.min(1), Validators.max(24), CustomValidators.hours()]]
    });
  }

  private loadLeafSites(): void {
    this.loadingSites = true;
    this.errorMessage = '';
    
    this.leafSiteService.getLeafSites().subscribe({
      next: (sites) => {
        this.zone.run(() => {
          this.leafSites = sites;
          this.loadingSites = false;
        });
      },
      error: (error) => {
        this.zone.run(() => {
          this.errorMessage = 'Failed to load parking sites. Please try again.';
          this.loadingSites = false;
        });
        console.error('Error loading leaf sites:', error);
      }
    });
  }

  private setupFormListeners(): void {
    // Listen to site selection changes
    this.bookingForm.get('siteId')?.valueChanges.subscribe((siteId) => {
      this.updatePriceCalculation(siteId);
    });

    // Listen to hours changes
    this.bookingForm.get('hours')?.valueChanges.subscribe(() => {
      const siteId = this.bookingForm.get('siteId')?.value;
      this.updatePriceCalculation(siteId);
    });
  }

  private updatePriceCalculation(siteId: string): void {
    if (!siteId) {
      this.priceCalculation = {
        pricePerHour: 0,
        hours: this.bookingForm.get('hours')?.value || 1,
        totalPrice: 0
      };
      return;
    }

    const selectedSite = this.leafSites.find(site => site.id === siteId);
    if (selectedSite) {
      const hours = this.bookingForm.get('hours')?.value || 1;
      this.priceCalculation = {
        pricePerHour: selectedSite.pricePerHour,
        hours: hours,
        totalPrice: selectedSite.pricePerHour * hours
      };
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const selectedSite = this.leafSites.find(site => site.id === this.bookingForm.value.siteId);
    
    // Prepare booking data matching backend CreateTicketDTO
    const bookingData: BookingRequest = {
      SiteName: selectedSite?.name || '',
      PlateNumber: this.bookingForm.value.plateNumber,
      PhoneNumber: this.bookingForm.value.phoneNumber,
      TotalPrice: this.priceCalculation.totalPrice,
      SiteId: this.bookingForm.value.siteId,
      NoOfHours: this.bookingForm.value.hours
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Convert backend response to TicketDetails for display
        const ticketDetails = {
          ticket_id: response.Id,
          siteName: selectedSite?.name || response.SiteName,
          siteNameAr: selectedSite?.nameAr || '',
          plateNumber: response.PlateNumber,
          phoneNumber: response.PhoneNumber,
          from: response.BookingFrom,
          to: response.BookingTo,
          totalPrice: response.TotalPrice,
          hours: bookingData.NoOfHours,
          pricePerHour: selectedSite?.pricePerHour || 0,
          createdAt: response.BookingFrom
        };
        
        // Navigate to ticket details page with ticket data
        this.router.navigate(['/ticket'], {
          state: { ticket: ticketDetails }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'An error occurred while processing your booking. Please try again.';
        console.error('Booking error:', error);
      }
    });
  }

  private resetForm(): void {
    this.bookingForm.reset({
      siteId: '',
      plateNumber: '',
      phoneNumber: '',
      hours: 1
    });
    this.priceCalculation = {
      pricePerHour: 0,
      hours: 1,
      totalPrice: 0
    };
  }

  // Getter methods for template
  get siteId() { return this.bookingForm.get('siteId'); }
  get plateNumber() { return this.bookingForm.get('plateNumber'); }
  get phoneNumber() { return this.bookingForm.get('phoneNumber'); }
  get hours() { return this.bookingForm.get('hours'); }

  // Check if form is valid for enabling submit button
  get isFormValid(): boolean {
    return this.bookingForm.valid && !this.isSubmitting;
  }

  // Enforce plate number format while typing
  onPlateNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();
    
    // Remove any characters that don't match the pattern
    // Allow only English digits (0-9) and English letters (A-Z)
    value = value.replace(/[^0-9A-Z]/g, '');
    
    // Extract digits at the start
    const digits = value.match(/^[0-9]+/)?.[0] || '';
    // Extract letters after digits
    const letters = value.replace(/^[0-9]+/, '');
    
    // Limit to 4 digits and 3 letters
    const limitedDigits = digits.slice(0, 4);
    const limitedLetters = letters.slice(0, 3);
    
    const newValue = limitedDigits + limitedLetters;
    
    if (newValue !== input.value) {
      input.value = newValue;
      this.bookingForm.patchValue({ plateNumber: newValue });
    }
  }

  // Get site name in current language
  getSiteName(site: LeafSiteDisplay): string {
    return this.translationService.currentLanguage === 'ar' ? site.nameAr : site.name;
  }
}
