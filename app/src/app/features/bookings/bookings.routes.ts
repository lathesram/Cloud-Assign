import { Routes } from '@angular/router';

export const bookingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/bookings-list/bookings-list.component').then(m => m.BookingsListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./components/booking-details/booking-details.component').then(m => m.BookingDetailsComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./components/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./components/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./components/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
  }
];