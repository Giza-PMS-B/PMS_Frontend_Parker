import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSubject = new BehaviorSubject<Language>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: Record<Language, Record<string, string>> = {
    en: {
      // Booking Form
      'booking.title': 'Reserve Parking Slot',
      'booking.siteLabel': 'Site Name',
      'booking.plateLabel': 'Plate Number',
      'booking.phoneLabel': 'Phone Number',
      'booking.hoursLabel': 'Hours',
      'booking.required': '*',
      'booking.selectSite': 'Select Site',
      'booking.platePlaceholder': 'e.g., 123ABC',
      'booking.phonePlaceholder': '05XXXXXXXX',
      'booking.hoursPlaceholder': '1 - 24',
      'booking.pricePerHour': 'Price per Hour:',
      'booking.totalPrice': 'Total Price:',
      'booking.sar': 'SAR',
      'booking.bookButton': 'Book Ticket',
      'booking.processing': 'Processing...',
      'booking.priceSummary': 'Price Summary',
      'booking.loadingSites': 'Loading parking sites...',
      
      // Validation Messages
      'validation.siteRequired': 'Please select a parking site',
      'validation.plateRequired': 'Plate number is required',
      'validation.plateInvalid': 'Plate number must be 1-4 digits followed by exactly 3 letters (e.g., 123ABC)',
      'validation.phoneRequired': 'Phone number is required',
      'validation.phoneInvalid': 'Invalid format. Must start with 05 and be 10 digits (e.g., 0512345678)',
      'validation.hoursRequired': 'Hours is required',
      'validation.hoursInvalid': 'Hours must be between 1 and 24',
      
      // Ticket Details
      'ticket.title': 'Parking Ticket',
      'ticket.subtitle': 'Booking Confirmed',
      'ticket.ticketId': 'Ticket ID',
      'ticket.siteName': 'Site Name',
      'ticket.plateNumber': 'Plate Number',
      'ticket.phoneNumber': 'Phone Number',
      'ticket.hours': 'Hours',
      'ticket.totalPrice': 'Total Price',
      'ticket.bookAnother': 'Book Another',
      'ticket.footer': 'Please keep this ticket for your records',
      'ticket.bookedOn': 'Booked on',
      
      // Error Messages
      'error.loadFailed': 'Failed to load parking sites. Please try again.',
      'error.bookingFailed': 'Booking failed. Please try again.',
      'error.processingError': 'An error occurred while processing your booking. Please try again.',
      
      // Language
      'lang.switch': 'العربية'
    },
    ar: {
      // Booking Form
      'booking.title': 'حجز موقف سيارات',
      'booking.siteLabel': 'اسم الموقع',
      'booking.plateLabel': 'رقم اللوحة',
      'booking.phoneLabel': 'رقم الهاتف',
      'booking.hoursLabel': ' عدد الساعات ',
      'booking.required': '*',
      'booking.selectSite': 'اختر الموقع',
      'booking.platePlaceholder': 'مثال: 123ABC',
      'booking.phonePlaceholder': '05XXXXXXXX',
      'booking.hoursPlaceholder': '1 - 24',
      'booking.pricePerHour': 'السعر في الساعة:',
      'booking.totalPrice': 'السعر الإجمالي:',
      'booking.sar': 'ريال',
      'booking.bookButton': 'احجز تذكرة',
      'booking.processing': 'جاري المعالجة...',
      'booking.priceSummary': 'ملخص السعر',
      'booking.loadingSites': 'جاري تحميل مواقف السيارات...',
      
      // Validation Messages
      'validation.siteRequired': 'الرجاء اختيار موقف سيارات',
      'validation.plateRequired': 'رقم اللوحة مطلوب',
      'validation.plateInvalid': 'يجب أن يكون رقم اللوحة من 1-4 أرقام متبوعة بـ 3 أحرف بالضبط (مثال: 123ABC)',
      'validation.phoneRequired': 'رقم الهاتف مطلوب',
      'validation.phoneInvalid': 'صيغة غير صحيحة. يجب أن يبدأ بـ 05 ويكون 10 أرقام (مثال: 0512345678)',
      'validation.hoursRequired': 'الساعات مطلوبة',
      'validation.hoursInvalid': 'يجب أن تكون الساعات بين 1 و 24',
      
      // Ticket Details
      'ticket.title': 'تذكرة موقف السيارات',
      'ticket.subtitle': 'تم تأكيد الحجز',
      'ticket.ticketId': 'رقم التذكرة',
      'ticket.siteName': 'اسم الموقع',
      'ticket.plateNumber': 'رقم اللوحة',
      'ticket.phoneNumber': 'رقم الهاتف',
      'ticket.hours': 'عدد الساعات',
      'ticket.totalPrice': 'السعر الإجمالي',
      'ticket.bookAnother': 'احجز تذكرة اخري',
      'ticket.footer': 'يرجى الاحتفاظ بهذه التذكرة لسجلاتك',
      'ticket.bookedOn': 'تم الحجز في',
      
      // Error Messages
      'error.loadFailed': 'فشل تحميل مواقف السيارات. يرجى المحاولة مرة أخرى.',
      'error.bookingFailed': 'فشل الحجز. يرجى المحاولة مرة أخرى.',
      'error.processingError': 'حدث خطأ أثناء معالجة حجزك. يرجى المحاولة مرة أخرى.',
      
      // Language
      'lang.switch': 'English'
    }
  };

  constructor() {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      this.currentLanguageSubject.next(savedLang);
      this.applyDirection(savedLang);
    }
  }

  get currentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  switchLanguage(): void {
    const newLang: Language = this.currentLanguage === 'en' ? 'ar' : 'en';
    this.currentLanguageSubject.next(newLang);
    localStorage.setItem('language', newLang);
    this.applyDirection(newLang);
  }

  translate(key: string): string {
    return this.translations[this.currentLanguage][key] || key;
  }

  private applyDirection(lang: Language): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
}
