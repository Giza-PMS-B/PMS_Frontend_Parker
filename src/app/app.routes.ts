import { Routes } from '@angular/router';
import { BookingFormComponent } from './features/booking-form/booking-form.component';
import { TicketDetailsComponent } from './features/booking-form/ticket-details/ticket-details.component';

export const routes: Routes = [
  { path: '', component: BookingFormComponent },
  { path: 'ticket', component: TicketDetailsComponent },
  { path: '**', redirectTo: '' }
];
