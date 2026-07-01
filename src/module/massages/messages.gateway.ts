// src/module/messages/messages.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe, UseFilters } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { MessagesService } from './massages.service';
import { WsUser } from '../auth/decorators/ws-user.decorator';

// Industry standard: Extend the base Socket type to include your authenticated user payload
interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    // Add additional properties here if your JWT contains them (e.g., email, role)
  };
}

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
@UseFilters(new BaseWsExceptionFilter())
@UsePipes(new ValidationPipe({ transform: true }))
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization;
      if (!token) throw new Error('Unauthorized');

      // Inject user decryption token details here
      // Replace this placeholder string with your real passport/jwt service decoding payload
      client.user = { id: 'extracted-user-uuid' };

      // Connect user to their own system notification listener pipeline
      await client.join(`user_${client.user.id}`);
      console.log(
        `⚡ Client connected: ${client.id} associated to User: ${client.user.id}`,
      );
    } catch (err) {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinRoom(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const isParticipant = await this.messagesService.validateParticipant(
      conversationId,
      client.user.id,
    );
    if (!isParticipant)
      return { event: 'error', data: 'Unauthorized conversation access.' };

    client.join(`convo_${conversationId}`);
    return { event: 'joined', room: `convo_${conversationId}` };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() dto: SendMessageDto, @WsUser() user: any) {
    const savedMessage = await this.messagesService.createMessage(dto, user.id);

    // 1. Emit real-time message stream to the current open window
    this.server
      .to(`convo_${dto.conversationId}`)
      .emit('newMessage', savedMessage);

    // 2. Refresh Messenger sidebar configurations for both target parties
    const participants = await this.messagesService.getConversationParticipants(
      dto.conversationId,
    );
    participants.forEach((userId) => {
      this.server.to(`user_${userId}`).emit('inboxUpdate', {
        conversationId: dto.conversationId,
        lastMessage: savedMessage,
      });
    });
  }
}
