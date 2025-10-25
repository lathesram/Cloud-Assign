import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  type: 'mentor' | 'mentee';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Mock user for development - replace with real authentication later
    this.setMockUser();
  }

  private setMockUser(): void {
    const mockUser: CurrentUser = {
      userId: 'user-' + Date.now(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      type: 'mentee'
    };
    this.currentUserSubject.next(mockUser);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.userId : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Mock login method - replace with real authentication
  login(email: string, password: string): Observable<boolean> {
    // This is just a mock implementation
    this.setMockUser();
    return new BehaviorSubject(true).asObservable();
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}