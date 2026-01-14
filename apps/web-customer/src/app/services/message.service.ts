import { Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: Date;
  isMine: boolean;
}

export interface Thread {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  productId?: string;
  productName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // Mock Data
  private mockThreads: Thread[] = [
    {
      id: 't1',
      participantId: 'v1',
      participantName: 'TechGiant Official',
      lastMessage: 'Your order has been shipped via Express.',
      lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 1,
      productId: 'p123',
      productName: 'Sony WH-1000XM5'
    },
    {
      id: 't2',
      participantId: 'v2',
      participantName: 'HomeStyle Decor',
      lastMessage: 'Thanks for your inquiry. Yes, it comes in blue.',
      lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      unreadCount: 0,
      productId: 'p456',
      productName: 'Velvet Accent Chair'
    }
  ];

  private mockMessages: Record<string, Message[]> = {
    't1': [
      { id: 'm1', threadId: 't1', senderId: 'u1', senderName: 'Me', recipientId: 'v1', content: 'Hi, when will this ship?', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), isMine: true },
      { id: 'm2', threadId: 't1', senderId: 'v1', senderName: 'TechGiant Official', recipientId: 'u1', content: 'Hello! It is being packed right now.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), isMine: false },
      { id: 'm3', threadId: 't1', senderId: 'v1', senderName: 'TechGiant Official', recipientId: 'u1', content: 'Your order has been shipped via Express.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isMine: false }
    ],
    't2': [
      { id: 'm4', threadId: 't2', senderId: 'u1', senderName: 'Me', recipientId: 'v2', content: 'Does this come in navy blue?', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50), isMine: true },
      { id: 'm5', threadId: 't2', senderId: 'v2', senderName: 'HomeStyle Decor', recipientId: 'u1', content: 'Thanks for your inquiry. Yes, it comes in blue.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), isMine: false }
    ]
  };

  getThreads() {
    return of(this.mockThreads).pipe(delay(500));
  }

  getMessages(threadId: string) {
    return of(this.mockMessages[threadId] || []).pipe(delay(300));
  }

  sendMessage(threadId: string, content: string) {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      threadId,
      senderId: 'u1',
      senderName: 'Me',
      recipientId: 'unknown', // simplifying
      content,
      read: false,
      createdAt: new Date(),
      isMine: true
    };

    if (!this.mockMessages[threadId]) {
      this.mockMessages[threadId] = [];
    }
    this.mockMessages[threadId].push(newMessage);
    
    // Update thread preview
    const thread = this.mockThreads.find(t => t.id === threadId);
    if (thread) {
        thread.lastMessage = content;
        thread.lastMessageDate = new Date();
    }

    return of(newMessage).pipe(delay(300));
  }
}
