import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService, Thread, Message } from '../../services/message.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32 pt-10">
      <div class="w-full px-6 animate-fade-in">
        
        <div class="mb-6">
            <h1 class="text-3xl font-normal text-neutral-charcoal">Message Center</h1>
            <p class="text-sm text-neutral-500">Communications with sellers and support</p>
        </div>

        <div class="bg-white border border-neutral-300 rounded-lg shadow-sm min-h-[600px] flex overflow-hidden">
            
            <!-- Sidebar: Threads -->
            <div class="w-1/3 border-r border-neutral-200 bg-neutral-50 flex flex-col">
                <div class="p-4 border-b border-neutral-200 bg-white">
                    <input type="text" placeholder="Search messages" class="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none">
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
                                {{ thread.productName || 'General Inquiry' }}
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
                    <div class="p-4 border-b border-neutral-200 flex justify-between items-center shadow-sm z-10">
                        <div>
                            <h2 class="font-bold text-neutral-800">{{ selectedThread()!.participantName }}</h2>
                            <p class="text-xs text-neutral-500">Topic: <span class="font-medium text-primary cursor-pointer hover:underline">{{ selectedThread()!.productName }}</span></p>
                        </div>
                        <button class="btn-secondary text-xs py-1.5 px-3 rounded border border-neutral-300">
                            View Order
                        </button>
                    </div>

                    <!-- Messages -->
                    <div class="flex-grow p-6 overflow-y-auto space-y-4 bg-neutral-50/30" #scrollContainer>
                        <div *ngFor="let msg of messages()" class="flex flex-col" [ngClass]="{'items-end': msg.isMine, 'items-start': !msg.isMine}">
                            <div class="max-w-[75%] rounded-lg p-3 text-sm shadow-sm relative group"
                                 [ngClass]="{
                                    'bg-primary text-white rounded-br-none': msg.isMine, 
                                    'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none': !msg.isMine
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
                        <div class="flex gap-4">
                            <textarea 
                                [(ngModel)]="newMessage" 
                                (keydown.enter)="sendMessage($event)"
                                rows="2" 
                                placeholder="Type your message..." 
                                class="flex-grow border border-neutral-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none resize-none"
                            ></textarea>
                            <button (click)="sendMessage()" [disabled]="!newMessage.trim()" class="btn-primary px-6 rounded-md self-end h-10 flex items-center justify-center">
                                <svg class="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                        <div class="flex gap-4 mt-2">
                             <button class="text-xs text-neutral-500 hover:text-neutral-700 flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                Attach File
                             </button>
                             <button class="text-xs text-neutral-500 hover:text-neutral-700">Request Invoice</button>
                        </div>
                    </div>
                </ng-container>

                <ng-template #noSelection>
                    <div class="flex-grow flex flex-col items-center justify-center text-neutral-400">
                        <div class="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        </div>
                        <p class="text-lg font-medium">Select a conversation to start messaging</p>
                    </div>
                </ng-template>

            </div>

        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit {
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
    // Mark as read mock
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

  scrollToBottom() {
      // Basic scroll logic implementation would go here
      // For now we rely on the user or natural browser behavior
  }
}
