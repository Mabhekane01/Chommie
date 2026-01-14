import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  public isConnected = signal(false);

  constructor(private authService: AuthService) {
    // Attempt connection if user is already logged in
    const user = this.authService.currentUser();
    if (user && user.id) {
        this.connect(user.id);
    }

    // Watch for login changes
    // In a real app, subscribe to auth state changes. For now, we rely on manual connect calls from Auth/App
  }

  connect(userId: string) {
    if (this.socket) return;

    // Assuming API Gateway is at port 3000
    this.socket = io('http://localhost:3000', {
        query: { userId },
        transports: ['websocket']
    });

    this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected.set(false);
    });
  }

  onOrderUpdate(callback: (order: any) => void) {
    if (!this.socket) return;
    this.socket.on('order_status', callback);
  }

  disconnect() {
    if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
    }
  }
}
