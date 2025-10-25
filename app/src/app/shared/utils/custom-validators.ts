import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  // Password strength validator
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;
      
      if (!passwordValid) {
        return { passwordStrength: true };
      }
      
      return null;
    };
  }
  
  // URL validator
  static validUrl(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      try {
        new URL(value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }
  
  // Phone number validator
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      
      if (!phoneRegex.test(value)) {
        return { invalidPhone: true };
      }
      
      return null;
    };
  }
  
  // Future date validator
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return { pastDate: true };
      }
      
      return null;
    };
  }
  
  // File type validator
  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if (!file) {
        return null;
      }
      
      const fileName = file.name ? file.name : file;
      
      if (typeof fileName === 'string') {
        const extension = fileName.toLowerCase().split('.').pop();
        if (extension && !allowedTypes.includes(extension)) {
          return { invalidFileType: { allowedTypes, actualType: extension } };
        }
      }
      
      return null;
    };
  }
  
  // File size validator (in bytes)
  static fileSize(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      
      if (!file || !file.size) {
        return null;
      }
      
      if (file.size > maxSize) {
        return { fileSizeExceeded: { maxSize, actualSize: file.size } };
      }
      
      return null;
    };
  }
  
  // Match field validator (for password confirmation)
  static matchField(fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      
      const fieldToMatch = control.parent.get(fieldName);
      
      if (!fieldToMatch) {
        return null;
      }
      
      if (control.value !== fieldToMatch.value) {
        return { fieldMismatch: true };
      }
      
      return null;
    };
  }
}