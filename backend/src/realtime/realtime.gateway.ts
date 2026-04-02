import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private presenceMap: Map<number, Set<number>> = new Map();
  private socketToUser: Map<string, { userId: number; workspaceId: number; name: string }> = new Map();

  constructor(private readonly realtimeService: RealtimeService) {}

  handleConnection(client: Socket) {
    console.log(`📡 Stream established: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const meta = this.socketToUser.get(client.id);
    if (meta) {
      const { userId, workspaceId } = meta;
      const activeUsers = this.presenceMap.get(workspaceId);
      if (activeUsers) {
        activeUsers.delete(userId);
        this.broadcastPresence(workspaceId);
      }
      this.socketToUser.delete(client.id);
    }
  }

  private broadcastPresence(workspaceId: number) {
    const activeUsers = this.presenceMap.get(workspaceId);
    this.server.to(`workspace_${workspaceId}`).emit('presenceUpdate', {
      onlineCount: activeUsers ? activeUsers.size : 0,
    });
  }

  @SubscribeMessage('joinWorkspace')
  handleJoinWorkspace(
    @MessageBody() data: { workspaceId: number; userId: number; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { workspaceId, userId, name } = data;
    const room = `workspace_${workspaceId}`;
    client.join(room);

    let activeUsers = this.presenceMap.get(workspaceId);
    if (!activeUsers) {
      activeUsers = new Set();
      this.presenceMap.set(workspaceId, activeUsers);
    }
    activeUsers.add(userId);
    this.socketToUser.set(client.id, { userId, workspaceId, name });

    this.broadcastPresence(workspaceId);
    
    // Standard event: user_joined
    this.server.to(room).emit('user_joined', {
      userId,
      name,
      message: `${name} has joined the synchronization.`,
    });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: { workspaceId: number; senderId: number; content: string },
  ) {
    const savedMessage = await this.realtimeService.saveMessage(
      data.workspaceId,
      data.senderId,
      data.content,
    );
    this.server.to(`workspace_${data.workspaceId}`).emit('receive_message', savedMessage);
    
    // Broadcast activity update to dashboard/workspace
    this.server.emit('activity_update', {
      type: 'message',
      content: `New intelligence shared: ${data.content.substring(0, 20)}...`,
      workspaceId: data.workspaceId,
      userName: savedMessage.sender?.name
    });
  }

  @SubscribeMessage('editor_update')
  async handleEditContent(
    @MessageBody() data: { workspaceId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`workspace_${data.workspaceId}`).emit('editor_receive', { content: data.content });
    await this.realtimeService.saveDocument(data.workspaceId, data.content);
  }

  @SubscribeMessage('joinEditor')
  async handleJoinEditor(
    @MessageBody() data: { workspaceId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const doc = await this.realtimeService.getDocument(data.workspaceId);
    client.emit('editor_receive', { content: doc.content });
  }

  // System Utility Broadcasts
  broadcastTaskEvent(workspaceId: number, type: 'task_created' | 'task_updated', task: any) {
    this.server.to(`workspace_${workspaceId}`).emit(type, task);
    this.server.emit('activity_update', {
      type,
      content: `${type === 'task_created' ? 'Initialized' : 'Updated'} task: ${task.title}`,
      workspaceId,
      userName: task.assignee?.name || 'System'
    });
  }
  
  @SubscribeMessage('typingStart')
  handleTypingStart(@MessageBody() data: { workspaceId: number; userId: number; name: string }, @ConnectedSocket() client: Socket) {
    client.to(`workspace_${data.workspaceId}`).emit('userTyping', { userId: data.userId, name: data.name, isTyping: true });
  }

  @SubscribeMessage('typingStop')
  handleTypingStop(@MessageBody() data: { workspaceId: number; userId: number }, @ConnectedSocket() client: Socket) {
    client.to(`workspace_${data.workspaceId}`).emit('userTyping', { userId: data.userId, isTyping: false });
  }
}
