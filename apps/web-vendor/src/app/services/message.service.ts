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
  // Mock Data (Vendor View)
  private mockThreads: Thread[] = [
    {
      id: 't1',
      participantId: 'u1',
      participantName: 'Alice Johnson',
      lastMessage: 'Your order has been shipped via Express.',
      lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
      productId: 'p123',
      productName: 'Sony WH-1000XM5'
    },
    {
      id: 't3',
      participantId: 'u5',
      participantName: 'Bob Smith',
      lastMessage: 'Is this item compatible with Mac?',
      lastMessageDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 1,
      productId: 'p789',
      productName: 'Mechanical Keyboard'
    }
  ];

  private mockMessages: Record<string, Message[]> = {
    't1': [
      { id: 'm1', threadId: 't1', senderId: 'u1', senderName: 'Alice Johnson', recipientId: 'v1', content: 'Hi, when will this ship?', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), isMine: false },
      { id: 'm2', threadId: 't1', senderId: 'v1', senderName: 'Me', recipientId: 'u1', content: 'Hello! It is being packed right now.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), isMine: true },
      { id: 'm3', threadId: 't1', senderId: 'v1', senderName: 'Me', recipientId: 'u1', content: 'Your order has been shipped via Express.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), isMine: true }
    ],
    't3': [
      { id: 'm6', threadId: 't3', senderId: 'u5', senderName: 'Bob Smith', recipientId: 'v1', content: 'Is this item compatible with Mac?', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), isMine: false }
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
      senderId: 'v1',
      senderName: 'Me',
      recipientId: 'unknown',
      content,
      read: false,
      createdAt: new Date(),
      isMine: true
    };

    if (!this.mockMessages[threadId]) {
      this.mockMessages[threadId] = [];
    }
    this.mockMessages[threadId].push(newMessage);
    
    const thread = this.mockThreads.find(t => t.id === threadId);
    if (thread) {
        thread.lastMessage = content;
        thread.lastMessageDate = new Date();
    }

    return of(newMessage).pipe(delay(300));
  }
}
