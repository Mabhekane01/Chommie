import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    // In a real app, we'd verify the JWT token here to join user-specific rooms
    const userId = client.handshake.query.userId as string;
    if (userId) {
        client.join(`user_${userId}`);
        this.logger.log(`Client ${client.id} joined room user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('order_update')
  handleOrderUpdate(client: Socket, payload: any): void {
    // This might be used if the client *sends* an update, but usually the server broadcasts.
    // We can expose a method to be called by controllers.
  }

  // Method to be called by controllers to broadcast events
  emitOrderUpdate(userId: string, orderData: any) {
    this.server.to(`user_${userId}`).emit('order_status', orderData);
    this.logger.log(`Emitted order_status to user_${userId}`);
  }
}
