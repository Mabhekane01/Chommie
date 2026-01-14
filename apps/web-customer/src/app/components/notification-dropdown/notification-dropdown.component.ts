import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="absolute top-12 right-0 w-80 bg-white border border-neutral-300 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
        <div class="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
            <h3 class="font-bold text-sm text-neutral-700">Notifications</h3>
            <button (click)="markAllRead()" class="text-xs text-primary hover:underline">Mark all as read</button>
        </div>
        
        <div class="max-h-96 overflow-y-auto">
            <div *ngIf="notificationService.notifications().length === 0" class="p-6 text-center text-neutral-500 text-sm italic">
                No new notifications.
            </div>

            <div *ngFor="let notification of notificationService.notifications()" 
                 class="p-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer relative"
                 [ngClass]="{'bg-blue-50/50': !notification.isRead}"
                 (click)="markAsRead(notification)">
                
                <div class="flex gap-3">
                    <div class="mt-1">
                        <div class="w-2 h-2 rounded-full" [ngClass]="notification.isRead ? 'bg-transparent' : 'bg-primary'"></div>
                    </div>
                    <div class="flex-grow">
                        <h4 class="text-sm font-bold text-neutral-800 leading-tight">{{ notification.title }}</h4>
                        <p class="text-xs text-neutral-600 mt-1 leading-snug">{{ notification.message }}</p>
                        <span class="text-[10px] text-neutral-400 mt-2 block">{{ notification.createdAt | date:'short' }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="bg-neutral-50 p-2 text-center border-t border-neutral-200">
            <a routerLink="/account" class="text-xs text-primary hover:underline font-bold">View Notification Settings</a>
        </div>
    </div>
  `
})
export class NotificationDropdownComponent {
  constructor(public notificationService: NotificationService) {}

  markAsRead(notification: any) {
    if (!notification.isRead) {
        this.notificationService.markAsRead(notification.id);
    }
  }

  markAllRead() {
      // Mock implementation
      this.notificationService.notifications.update(list => list.map(n => ({...n, isRead: true})));
      this.notificationService.unreadCount.set(0);
  }
}
