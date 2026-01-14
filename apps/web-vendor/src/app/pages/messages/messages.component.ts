import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService, Thread, Message } from '../../services/message.service';

@Component({
  selector: 'app-vendor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      <!-- Standard Vendor Nav -->
      <nav class="bg-white border-b border-neutral-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-8">
              <a routerLink="/" class="font-header font-bold text-2xl tracking-tight text-neutral-charcoal flex items-center gap-1">
                Chommie<span class="text-primary">.central</span>
              </a>
              <div class="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                  <a routerLink="/dashboard" class="hover:text-primary transition-colors">Dashboard</a>
                  <a href="#" class="hover:text-primary transition-colors">Orders</a>
                  <a routerLink="/messages" class="hover:text-primary transition-colors text-primary font-bold">Messages</a>
              </div>
          </div>
      </nav>

      <div class="p-8 max-w-[1600px] mx-auto animate-fade-in">
        
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Buyer Messages</h1>
            <div class="text-sm text-neutral-500">
                Response Rate: <span class="font-bold text-emerald-600">98% (Under 24h)</span>
            </div>
        </div>

        <div class="bg-white border border-neutral-300 rounded-lg shadow-sm min-h-[700px] flex overflow-hidden">
            
            <!-- Sidebar: Threads -->
            <div class="w-1/3 border-r border-neutral-200 bg-neutral-50 flex flex-col">
                <div class="p-4 border-b border-neutral-200 bg-white">
                    <div class="flex gap-2 mb-2">
                        <button class="bg-neutral-800 text-white text-xs py-1 px-3 rounded-full font-bold">All</button>
                        <button class="bg-neutral-200 text-neutral-600 text-xs py-1 px-3 rounded-full font-bold hover:bg-neutral-300">Unread</button>
                        <button class="bg-neutral-200 text-neutral-600 text-xs py-1 px-3 rounded-full font-bold hover:bg-neutral-300">Flagged</button>
                    </div>
                    <input type="text" placeholder="Search order ID or buyer" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
                </div>
                
                <div class="overflow-y-auto flex-grow">
                    <div *ngFor="let thread of threads()" 
                         (click)="selectThread(thread)"
                         class="p-4 border-b border-neutral-100 cursor-pointer hover:bg-white transition-colors relative"
                         [ngClass]="{'bg-white border-l-4 border-l-primary': selectedThread()?.id === thread.id, 'border-l-4 border-l-transparent': selectedThread()?.id !== thread.id}">
                        
                        <div class="flex justify-between items-start mb-1">
                            <h3 class="font-bold text-sm text-neutral-800 truncate pr-2">{{ thread.participantName }}</h3>
                            <span class="text-[10px] text-neutral-400 whitespace-nowrap">{{ thread.lastMessageDate | date:'MMM d' }}</span>
                        </div>
                        
                        <p class="text-xs text-neutral-500 truncate mb-1" [class.font-bold]="thread.unreadCount > 0" [class.text-neutral-800]="thread.unreadCount > 0">
                            {{ thread.lastMessage }}
                        </p>
                        
                        <div class="flex items-center justify-between mt-2">
                             <span class="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                                {{ thread.productName }}
                             </span>
                             <span *ngIf="thread.unreadCount > 0" class="bg-primary text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center">
                                {{ thread.unreadCount }}
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main: Chat Area -->
            <div class="w-2/3 flex flex-col bg-white">
                
                <ng-container *ngIf="selectedThread(); else noSelection">
                    <!-- Chat Header -->
                    <div class="p-4 border-b border-neutral-200 flex justify-between items-center shadow-sm z-10 bg-neutral-50/50">
                        <div>
                            <h2 class="font-bold text-neutral-800">{{ selectedThread()!.participantName }}</h2>
                            <p class="text-xs text-neutral-500">Product: <span class="font-medium">{{ selectedThread()!.productName }}</span></p>
                        </div>
                        <div class="flex gap-2">
                             <button class="btn-secondary text-xs py-1.5 px-3 rounded border border-neutral-300">
                                Order Details
                             </button>
                             <button class="btn-secondary text-xs py-1.5 px-3 rounded border border-neutral-300 text-red-600 hover:bg-red-50">
                                Report
                             </button>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-white" #scrollContainer>
                        <div *ngFor="let msg of messages()" class="flex flex-col" [ngClass]="{'items-end': msg.isMine, 'items-start': !msg.isMine}">
                            <div class="max-w-[75%] rounded-lg p-3 text-sm shadow-sm relative group"
                                 [ngClass]="{
                                    'bg-primary text-white rounded-br-none': msg.isMine, 
                                    'bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-bl-none': !msg.isMine
                                 }">
                                {{ msg.content }}
                                <span class="text-[9px] absolute bottom-1 right-2 opacity-0 group-hover:opacity-60 transition-opacity" 
                                      [ngClass]="{'text-white': msg.isMine, 'text-neutral-500': !msg.isMine}">
                                    {{ msg.createdAt | date:'shortTime' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-4 border-t border-neutral-200 bg-white">
                        <!-- Quick Replies -->
                        <div class="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button (click)="useTemplate('Thanks for reaching out. Let me check that for you.')" class="whitespace-nowrap bg-neutral-100 hover:bg-neutral-200 text-xs px-3 py-1 rounded-full text-neutral-600 border border-neutral-200">
                                "Let me check..."
                            </button>
                            <button (click)="useTemplate('Your order has been shipped.')" class="whitespace-nowrap bg-neutral-100 hover:bg-neutral-200 text-xs px-3 py-1 rounded-full text-neutral-600 border border-neutral-200">
                                "Order shipped"
                            </button>
                            <button (click)="useTemplate('Can you provide more details?')" class="whitespace-nowrap bg-neutral-100 hover:bg-neutral-200 text-xs px-3 py-1 rounded-full text-neutral-600 border border-neutral-200">
                                "More details?"
                            </button>
                        </div>

                        <div class="flex gap-4">
                            <textarea 
                                [(ngModel)]="newMessage" 
                                (keydown.enter)="sendMessage($event)"
                                rows="3" 
                                placeholder="Type your reply..." 
                                class="flex-grow border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none resize-none"
                            ></textarea>
                            <button (click)="sendMessage()" [disabled]="!newMessage.trim()" class="btn-primary px-6 rounded-md self-end h-10 flex items-center justify-center">
                                Reply
                            </button>
                        </div>
                        <div class="flex justify-between mt-2 text-xs text-neutral-500">
                             <div class="flex gap-4">
                                 <button class="hover:text-neutral-700 flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                    Attach File
                                 </button>
                             </div>
                             <span>Press Enter to send</span>
                        </div>
                    </div>
                </ng-container>

                <ng-template #noSelection>
                    <div class="flex-grow flex flex-col items-center justify-center text-neutral-400">
                        <div class="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <p class="text-lg font-medium">Select a message to view</p>
                    </div>
                </ng-template>

            </div>

        </div>
      </div>
    </div>
  `
})
export class VendorMessagesComponent implements OnInit {
  threads = signal<Thread[]>([]);
  selectedThread = signal<Thread | null>(null);
  messages = signal<Message[]>([]);
  newMessage = '';

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadThreads();
  }

  loadThreads() {
    this.messageService.getThreads().subscribe(data => {
        this.threads.set(data);
    });
  }

  selectThread(thread: Thread) {
    this.selectedThread.set(thread);
    thread.unreadCount = 0;
    
    this.messageService.getMessages(thread.id).subscribe(msgs => {
        this.messages.set(msgs);
        setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  sendMessage(event?: Event) {
    if (event) event.preventDefault();
    if (!this.newMessage.trim() || !this.selectedThread()) return;

    this.messageService.sendMessage(this.selectedThread()!.id, this.newMessage).subscribe(msg => {
        this.messages.update(prev => [...prev, msg]);
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  useTemplate(text: string) {
      this.newMessage = text;
  }

  scrollToBottom() {
      // Basic scroll implementation
  }
}
