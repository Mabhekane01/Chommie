import { Component, signal, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-ai-concierge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Boxy Chat Interface -->
    <div class="fixed bottom-24 right-6 z-[100] flex flex-col items-end gap-2 font-body">
      
      <div *ngIf="isOpen()" class="w-[380px] h-[600px] bg-white border border-neutral-300 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-scale-up ring-1 ring-black/5">
        <!-- Header: Amazon Style -->
        <div class="bg-gradient-to-r from-[#232f3e] to-[#131921] h-14 flex items-center justify-between px-5 text-white shadow-md shrink-0">
           <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                 <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div class="flex flex-col">
                 <h3 class="text-sm font-bold leading-none tracking-tight">Chommie <span class="text-primary italic">Assistant</span></h3>
                 <span class="text-[9px] text-neutral-400 font-medium uppercase tracking-widest">Automated Support</span>
              </div>
           </div>
           <button (click)="toggleChat()" class="text-neutral-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
           </button>
        </div>

        <!-- Feed: High Density -->
        <div class="flex-grow p-5 overflow-y-auto space-y-5 bg-[#F2F4F8] scrollbar-hide" #scrollContainer>
           <!-- Initial Greeting -->
           <div class="text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Today</div>

           <div *ngFor="let msg of messages()" 
                class="flex flex-col gap-1"
                [ngClass]="msg.isBot ? 'items-start' : 'items-end'">
              
              <span *ngIf="msg.isBot" class="text-[9px] font-bold text-neutral-500 ml-1">Assistant</span>
              
              <div [ngClass]="msg.isBot ? 'bg-white text-neutral-800 rounded-tr-lg rounded-br-lg rounded-bl-lg' : 'bg-primary text-white rounded-tl-lg rounded-bl-lg rounded-br-lg'"
                   class="max-w-[85%] px-4 py-3 text-sm font-medium shadow-sm leading-relaxed border border-transparent"
                   [class.border-neutral-200]="msg.isBot">
                 {{ msg.text }}
              </div>

              <!-- Action button: Amazon Link Style -->
              <button *ngIf="msg.action && msg.action !== 'NONE'" 
                      (click)="handleAction(msg.action)"
                      class="mt-1 ml-1 self-start text-xs font-bold text-[#007185] hover:text-[#C7511F] hover:underline transition-all flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm">
                 <span>Use Feature</span> 
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
           </div>

           <!-- Loading Indicator -->
           <div *ngIf="isTyping()" class="flex items-center gap-2 text-xs text-neutral-400 font-bold ml-2">
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <span>Processing...</span>
           </div>
        </div>

        <!-- Inputs: Sharp & Boxy -->
        <div class="p-4 bg-white border-t border-neutral-200 shrink-0">
           <div class="relative">
              <input type="text" [(ngModel)]="userInput" (keyup.enter)="sendMessage()" 
                     placeholder="Type your question..."
                     class="w-full h-12 pl-4 pr-12 border border-neutral-400 rounded-sm text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-inner bg-white placeholder-neutral-500">
              <button (click)="sendMessage()" [disabled]="!userInput.trim()"
                      class="absolute right-1 top-1 h-10 w-10 flex items-center justify-center text-neutral-500 hover:text-primary transition-colors disabled:opacity-30">
                 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
           </div>
           <div class="text-[9px] text-neutral-400 text-center mt-2 font-medium">
              Powered by Chommie Neural Engine
           </div>
        </div>
      </div>

      <!-- Trigger: Boxy -->
      <button (click)="toggleChat()" 
              [ngClass]="isOpen() ? 'scale-0' : 'scale-100'"
              class="w-14 h-14 bg-[#232f3e] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:bg-primary group border-2 border-white relative">
         <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#232f3e]"></span>
         <!-- Robot Icon -->
         <svg class="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
         </svg>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-scale-up {
      animation: scaleUp 0.2s ease-out forwards;
    }
    @keyframes scaleUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AiConciergeComponent implements AfterViewChecked {
  private productService = inject(ProductService);
  private router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  userInput = '';
  
  messages = signal<{text: string, isBot: boolean, action?: string}[]>([
    { text: "Hello! I'm your Chommie Assistant. I can help you track orders, check your Trust Score, or find the best deals.", isBot: true }
  ]);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const query = this.userInput;
    this.messages.update(m => [...m, { text: query, isBot: false }]);
    this.userInput = '';
    this.isTyping.set(true);

    this.productService.aiChat(query, localStorage.getItem('user_id')).subscribe({
        next: (res) => {
            setTimeout(() => {
                this.messages.update(m => [...m, { text: res.text, isBot: true, action: res.action }]);
                this.isTyping.set(false);
            }, 600);
        },
        error: () => {
            this.messages.update(m => [...m, { text: "Sorry, I'm having trouble connecting. Please try again.", isBot: true }]);
            this.isTyping.set(false);
        }
    });
  }

  handleAction(action: string) {
    switch (action) {
        case 'NAVIGATE_ORDERS': this.router.navigate(['/orders']); break;
        case 'NAVIGATE_BNPL': this.router.navigate(['/bnpl']); break;
        case 'NAVIGATE_DEALS': this.router.navigate(['/products'], { queryParams: { deals: true } }); break;
    }
    this.isOpen.set(false);
  }
}