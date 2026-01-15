import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  isMobile = signal<boolean>(false);

  constructor() {
    this.checkWidth();
    window.addEventListener('resize', () => this.checkWidth());
  }

  private checkWidth() {
    this.isMobile.set(window.innerWidth < 1024); // lg breakpoint
  }
}
