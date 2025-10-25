import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/users-list/users-list.component').then(m => m.UsersListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'profile/:id',
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'form/:id',
    loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: 'mentors',
    loadComponent: () => import('./components/mentors-list/mentors-list.component').then(m => m.MentorsListComponent)
  },
  {
    path: 'mentees',
    loadComponent: () => import('./components/mentees-list/mentees-list.component').then(m => m.MenteesListComponent)
  }
];