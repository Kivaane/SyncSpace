import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly realtimeService;
    server: Server;
    private presenceMap;
    private socketToUser;
    constructor(realtimeService: RealtimeService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private broadcastPresence;
    handleJoinWorkspace(data: {
        workspaceId: number;
        userId: number;
        name: string;
    }, client: Socket): void;
    handleSendMessage(data: {
        workspaceId: number;
        senderId: number;
        content: string;
    }): Promise<void>;
    handleEditContent(data: {
        workspaceId: number;
        content: string;
    }, client: Socket): Promise<void>;
    handleJoinEditor(data: {
        workspaceId: number;
    }, client: Socket): Promise<void>;
    broadcastTaskEvent(workspaceId: number, type: 'task_created' | 'task_updated', task: any): void;
    handleTypingStart(data: {
        workspaceId: number;
        userId: number;
        name: string;
    }, client: Socket): void;
    handleTypingStop(data: {
        workspaceId: number;
        userId: number;
    }, client: Socket): void;
}
