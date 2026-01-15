import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService, Thread, Message } from '../../services/message.service';
import { DeviceService } from '../../services/device.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-vendor-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-neutral-100 text-neutral-charcoal pb-32">
      
      @if (deviceService.isMobile()) {
        <!-- MOBILE MESSAGES UI -->
        <div class="flex flex-col h-[calc(100vh-96px)] animate-fade-in bg-white">
           
           <!-- Thread List View -->
           <div *ngIf="!selectedThread()" class="flex flex-col h-full">
              <div class="p-4 border-b border-neutral-200">
                 <h1 class="text-xl font-bold mb-4 px-1">Buyer Messages</h1>
                 <div class="relative">
                    <input type="text" placeholder="Search buyers..." class="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-sm outline-none focus:border-primary shadow-inner">
                    <svg class="absolute left-3 top-2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </div>
              </div>

              <div class="overflow-y-auto flex-grow divide-y divide-neutral-100">
                 <div *ngFor="let thread of threads()" 
                      (click)="selectThread(thread)"
                      class="p-4 flex gap-4 active:bg-neutral-50 transition-colors">
                    <div class="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center shrink-0 font-bold text-neutral-400 text-sm">
                       {{ thread.participantName.charAt(0) }}
                    </div>
                    <div class="flex-grow min-w-0">
                       <div class="flex justify-between items-start mb-0.5">
                          <h3 class="text-sm font-bold text-neutral-800 truncate">{{ thread.participantName }}</h3>
                          <span class="text-[10px] text-neutral-400">{{ thread.lastMessageDate | date:'shortDate' }}</span>
                       </div>
                       <p class="text-xs text-neutral-500 truncate" [class.font-bold]="thread.unreadCount > 0">{{ thread.lastMessage }}</p>
                       <div class="flex justify-between items-center mt-2">
                          <span class="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-400 uppercase font-bold">{{ thread.productName }}</span>
                          <span *ngIf="thread.unreadCount > 0" class="w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ thread.unreadCount }}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Individual Chat View -->
           <div *ngIf="selectedThread()" class="flex flex-col h-full animate-fade-in">
              <div class="p-3 border-b border-neutral-200 flex items-center gap-3">
                 <button (click)="selectedThread.set(null)" class="p-2 text-neutral-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                 </button>
                 <div>
                    <h2 class="text-sm font-bold">{{ selectedThread()!.participantName }}</h2>
                    <p class="text-[10px] text-neutral-400 uppercase font-bold">RE: {{ selectedThread()!.productName }}</p>
                 </div>
              </div>

              <div class="flex-grow p-4 overflow-y-auto space-y-4 bg-neutral-50 shadow-inner">
                 <div *ngFor="let msg of messages()" class="flex flex-col" [ngClass]="msg.isMine ? 'items-end' : 'items-start'">
                    <div class="max-w-[85%] p-3 text-xs shadow-sm rounded-lg"
                         [ngClass]="msg.isMine ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-neutral-300 text-neutral-800 rounded-bl-none'">
                       {{ msg.content }}
                    </div>
                    <span class="text-[8px] text-neutral-400 mt-1 px-1 uppercase">{{ msg.createdAt | date:'shortTime' }}</span>
                 </div>
              </div>

              <div class="p-3 bg-white border-t border-neutral-200">
                 <div class="flex gap-2">
                    <textarea [(ngModel)]="newMessage" rows="1" placeholder="Reply..." class="flex-grow bg-neutral-100 border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:bg-white outline-none resize-none transition-all"></textarea>
                    <button (click)="sendMessage()" class="bg-primary text-white p-3 rounded-full shadow-lg">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      } @else {
        <!-- DESKTOP MESSAGES UI -->
        <div class="p-8 max-w-[1600px] mx-auto animate-fade-in">
          <div class="flex justify-between items-center mb-10">
              <h1 class="text-3xl font-header font-bold text-neutral-charcoal">Message Center</h1>
              <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-neutral-300 shadow-sm">
                  <span class="text-[10px] font-bold text-neutral-400 uppercase">Fulfillment Response Rate:</span>
                  <span class="text-[10px] font-bold text-emerald-600">98% OPTIMAL</span>
              </div>
          </div>

          <div class="bg-white border border-neutral-300 rounded-lg shadow-sm min-h-[700px] flex overflow-hidden">
              <!-- Desktop Sidebar -->
              <div class="w-1/3 border-r border-neutral-200 bg-neutral-50 flex flex-col">
                  <div class="p-6 border-b border-neutral-200 bg-white">
                      <div class="flex gap-3 mb-4">
                          <button class="bg-neutral-800 text-white text-[10px] py-1.5 px-4 rounded-md font-bold uppercase tracking-widest shadow-sm">All</button>
                          <button class="bg-white border border-neutral-300 text-neutral-500 text-[10px] py-1.5 px-4 rounded-md font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors">Unread</button>
                      </div>
                      <div class="relative">
                         <input type="text" placeholder="Search transmissions..." class="w-full border border-neutral-300 rounded-md pl-10 pr-4 py-2 text-sm focus:border-primary outline-none shadow-inner transition-all">
                         <svg class="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </div>
                  </div>
                  
                  <div class="overflow-y-auto flex-grow divide-y divide-neutral-100">
                      <div *ngFor="let thread of threads()" 
                           (click)="selectThread(thread)"
                           class="p-6 cursor-pointer hover:bg-white transition-all relative"
                           [ngClass]="{'bg-white border-l-4 border-l-primary shadow-inner': selectedThread()?.id === thread.id, 'border-l-4 border-l-transparent': selectedThread()?.id !== thread.id}">
                          
                          <div class="flex justify-between items-start mb-2">
                              <h3 class="font-bold text-sm text-neutral-800 uppercase tracking-tight">{{ thread.participantName }}</h3>
                              <span class="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{{ thread.lastMessageDate | date:'MMM d' }}</span>
                          </div>
                          
                          <p class="text-xs text-neutral-500 line-clamp-1 mb-3" [class.font-bold]="thread.unreadCount > 0" [class.text-neutral-800]="thread.unreadCount > 0">
                              {{ thread.lastMessage }}
                          </p>
                          
                          <div class="flex items-center justify-between">
                               <span class="text-[9px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md border border-neutral-200 uppercase tracking-tighter">
                                  RE: {{ thread.productName }}
                               </span>
                               <span *ngIf="thread.unreadCount > 0" class="bg-primary text-white text-[10px] font-bold px-2 rounded-full shadow-lg">
                                  {{ thread.unreadCount }}
                               </span>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Desktop Chat Area -->
              <div class="w-2/3 flex flex-col bg-white">
                  <ng-container *ngIf="selectedThread(); else noSelection">
                      <div class="p-6 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/30">
                          <div>
                              <h2 class="font-bold text-neutral-800 uppercase tracking-widest text-sm">{{ selectedThread()!.participantName }}</h2>
                              <p class="text-[10px] text-neutral-400 font-medium uppercase mt-1">Asset: <span class="text-neutral-600 font-bold underline">{{ selectedThread()!.productName }}</span></p>
                          </div>
                          <div class="flex gap-3">
                               <button class="bg-white border border-neutral-300 text-neutral-600 text-[10px] font-bold uppercase px-4 py-2 rounded-md hover:bg-neutral-50 transition-all shadow-sm">
                                  Asset Details
                               </button>
                               <button class="bg-white border border-neutral-300 text-red-600 text-[10px] font-bold uppercase px-4 py-2 rounded-md hover:bg-red-50 transition-all shadow-sm">
                                  Report Signal
                               </button>
                          </div>
                      </div>

                      <div class="flex-grow p-10 overflow-y-auto space-y-6 bg-white shadow-inner" #scrollContainer>
                          <div *ngFor="let msg of messages()" class="flex flex-col" [ngClass]="msg.isMine ? 'items-end' : 'items-start'">
                              <div class="max-w-[70%] rounded-lg p-4 text-sm shadow-sm relative group"
                                   [ngClass]="msg.isMine ? 'bg-primary text-white rounded-br-none' : 'bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-bl-none'">
                                  {{ msg.content }}
                              </div>
                              <span class="text-[9px] font-bold text-neutral-300 mt-2 uppercase tracking-widest px-1">{{ msg.createdAt | date:'shortTime' }}</span>
                          </div>
                      </div>

                      <div class="p-8 border-t border-neutral-200 bg-white">
                          <div class="flex gap-6">
                              <textarea 
                                  [(ngModel)]="newMessage" 
                                  (keydown.enter)="sendMessage($event)"
                                  rows="3" 
                                  placeholder="Formulate response..." 
                                  class="flex-grow border-2 border-neutral-100 bg-neutral-50 rounded-lg px-6 py-4 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all shadow-inner"
                              ></textarea>
                              <button (click)="sendMessage()" [disabled]="!newMessage.trim()" class="bg-primary text-white px-10 rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all self-end h-14">
                                  Relay
                              </button>
                          </div>
                          <div class="flex justify-between mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                               <button class="hover:text-primary transition-colors flex items-center gap-2">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                  Attach Documentation
                               </button>
                               <span class="text-neutral-300 font-medium">Auto-Sync Protocol Active</span>
                          </div>
                      </div>
                  </ng-container>

                  <ng-template #noSelection>
                      <div class="flex-grow flex flex-col items-center justify-center bg-neutral-50/30">
                          <div class="w-24 h-24 bg-white border border-neutral-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm text-neutral-200">
                              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          </div>
                          <p class="text-sm font-bold text-neutral-400 uppercase tracking-[0.2em]">Select transmission stream</p>
                      </div>
                  </ng-template>
              </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class VendorMessagesComponent implements OnInit {
  public deviceService = inject(DeviceService);
  public ts = inject(TranslationService);
  private messageService = inject(MessageService);

  threads = signal<Thread[]>([]);
  selectedThread = signal<Thread | null>(null);
  messages = signal<Message[]>([]);
  newMessage = '';

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
    });
  }

  sendMessage(event?: Event) {
    if (event) event.preventDefault();
    if (!this.newMessage.trim() || !this.selectedThread()) return;

    this.messageService.sendMessage(this.selectedThread()!.id, this.newMessage).subscribe(msg => {
        this.messages.update(prev => [...prev, msg]);
        this.newMessage = '';
    });
  }

  useTemplate(text: string) {
      this.newMessage = text;
  }
}