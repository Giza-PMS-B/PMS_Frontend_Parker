import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Validates Saudi plate numbers
   * Format: 1-4 English digits followed by exactly 3 English letters
   * Example: 1ABC, 12ABC, 123ABC, 1234ABC
   */
  static plateNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // If empty, let required validator handle it
      
      // Accepts 1-4 English digits (0-9) followed by exactly 3 English letters (A-Z)
      const plateRegex = /^[0-9]{1,4}[A-Z]{3}$/;
      const isValid = plateRegex.test(value);
      
      return isValid 
        ? null  // Valid - no error
        : { invalidPlateNumber: true }; // Invalid - return error
    };
  }

  /**
   * Validates Saudi phone numbers
   * Format: 05 followed by exactly 8 digits
   * Example: 0512345678, 0598765432
   */
  static saudiPhoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const phoneRegex = /^05\d{8}$/;
      const isValid = phoneRegex.test(value);
      
      return isValid 
        ? null 
        : { invalidPhoneNumber: true };
    };
  }

  /**
   * Validates hours input
   * Must be integer between 1 and 24
   */
  static hours(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const hours = Number(value);
      const isValid = hours >= 1 && hours <= 24 && Number.isInteger(hours);
      
      return isValid 
        ? null 
        : { invalidHours: true };
    };
  }
}