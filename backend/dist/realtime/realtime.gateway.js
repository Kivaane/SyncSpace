"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const realtime_service_1 = require("./realtime.service");
let RealtimeGateway = class RealtimeGateway {
    realtimeService;
    server;
    presenceMap = new Map();
    socketToUser = new Map();
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    handleConnection(client) {
        console.log(`📡 Stream established: ${client.id}`);
    }
    handleDisconnect(client) {
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
    broadcastPresence(workspaceId) {
        const activeUsers = this.presenceMap.get(workspaceId);
        this.server.to(`workspace_${workspaceId}`).emit('presenceUpdate', {
            onlineCount: activeUsers ? activeUsers.size : 0,
        });
    }
    handleJoinWorkspace(data, client) {
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
        this.server.to(room).emit('user_joined', {
            userId,
            name,
            message: `${name} has joined the synchronization.`,
        });
    }
    async handleSendMessage(data) {
        const savedMessage = await this.realtimeService.saveMessage(data.workspaceId, data.senderId, data.content);
        this.server.to(`workspace_${data.workspaceId}`).emit('receive_message', savedMessage);
        this.server.emit('activity_update', {
            type: 'message',
            content: `New intelligence shared: ${data.content.substring(0, 20)}...`,
            workspaceId: data.workspaceId,
            userName: savedMessage.sender?.name
        });
    }
    async handleEditContent(data, client) {
        client.to(`workspace_${data.workspaceId}`).emit('editor_receive', { content: data.content });
        await this.realtimeService.saveDocument(data.workspaceId, data.content);
    }
    async handleJoinEditor(data, client) {
        const doc = await this.realtimeService.getDocument(data.workspaceId);
        client.emit('editor_receive', { content: doc.content });
    }
    broadcastTaskEvent(workspaceId, type, task) {
        this.server.to(`workspace_${workspaceId}`).emit(type, task);
        this.server.emit('activity_update', {
            type,
            content: `${type === 'task_created' ? 'Initialized' : 'Updated'} task: ${task.title}`,
            workspaceId,
            userName: task.assignee?.name || 'System'
        });
    }
    handleTypingStart(data, client) {
        client.to(`workspace_${data.workspaceId}`).emit('userTyping', { userId: data.userId, name: data.name, isTyping: true });
    }
    handleTypingStop(data, client) {
        client.to(`workspace_${data.workspaceId}`).emit('userTyping', { userId: data.userId, isTyping: false });
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinWorkspace'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleJoinWorkspace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('editor_update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleEditContent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinEditor'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinEditor", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typingStart'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typingStop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleTypingStop", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map