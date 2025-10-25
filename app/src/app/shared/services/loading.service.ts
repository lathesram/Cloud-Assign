import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private loadingCountSubject = new BehaviorSubject<number>(0);
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    this.loadingCountSubject.next(this.requestCount);
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    this.loadingCountSubject.next(this.requestCount);
    
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  forceHide(): void {
    this.requestCount = 0;
    this.loadingCountSubject.next(0);
    this.loadingSubject.next(false);
  }
}