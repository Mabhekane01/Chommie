import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TrustScoreWidgetComponent } from './components/trust-score-widget/trust-score-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TrustScoreWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn = signal(false);
  userId = signal<string | null>(null);

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    const token = localStorage.getItem('access_token');
    const id = localStorage.getItem('user_id');
    this.isLoggedIn.set(!!token);
    this.userId.set(id);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    this.isLoggedIn.set(false);
    this.userId.set(null);
    this.router.navigate(['/login']);
  }
}