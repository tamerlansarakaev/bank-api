import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IRoomMessage } from '../interfaces/WebSocket';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway {
  constructor(private jwtService: JwtService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    const adapter = this.server.sockets.adapter;
    const roomExists = adapter.rooms.has(room);
    console.log(client.rooms);
    if (roomExists) {
      console.log('Error');
      return this.server.emit('message', 'Entry is prohibited for you');
    }
    client.join(room);
    return { room, id: client.id };
  }

  @SubscribeMessage('roomMessage')
  handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: IRoomMessage,
  ) {
    this.server.to(data.room).emit('roomMessage', {
      room: data.room,
      id: client.id,
      jwtToken: data.jwtToken,
      message: data.message,
    });
    
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room) {
    client.leave(room);
  }
}
