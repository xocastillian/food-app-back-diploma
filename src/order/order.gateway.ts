import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from './schemas/order.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway {
  @WebSocketServer()
  server: Server;

  notifyNewOrder(order: Order) {
    this.server.emit('order:new', order);
  }

  notifyOrderStatusUpdated(order: Order) {
    this.server.emit('order:status-updated', order);
  }
}
