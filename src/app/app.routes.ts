import { Routes } from '@angular/router';
import { BookingFormComponent } from './features/booking-form/booking-form.component';

export const routes: Routes = [
  { path: '', component: BookingFormComponent },
  { path: '**', redirectTo: '' }
];
