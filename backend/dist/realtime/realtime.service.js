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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RealtimeService = class RealtimeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveMessage(workspaceId, senderId, content) {
        const msg = await this.prisma.message.create({
            data: { workspaceId, senderId, content },
            include: { sender: { select: { id: true, name: true, email: true } } },
        });
        await this.logActivity(workspaceId, senderId, 'message', content);
        return msg;
    }
    async getMessages(workspaceId) {
        return this.prisma.message.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, email: true } } },
        });
    }
    async getDocument(workspaceId) {
        let doc = await this.prisma.document.findUnique({
            where: { workspaceId },
        });
        if (!doc) {
            doc = await this.prisma.document.create({
                data: { workspaceId, content: '# Welcome to your Workspace\n\nStart collaborating here...' },
            });
        }
        return doc;
    }
    async saveDocument(workspaceId, content) {
        return this.prisma.document.upsert({
            where: { workspaceId },
            update: { content },
            create: { workspaceId, content },
        });
    }
    async logActivity(workspaceId, userId, type, content) {
        return this.prisma.activity.create({
            data: {
                workspaceId,
                userId,
                type,
                content,
            },
        });
    }
    async getActivities(workspaceId) {
        return this.prisma.activity.findMany({
            where: workspaceId ? { workspaceId } : {},
            include: {
                user: { select: { name: true } },
                workspace: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    async getGlobalStats() {
        const [messages, tasks, users] = await Promise.all([
            this.prisma.message.count(),
            this.prisma.task.count({ where: { status: 'done' } }),
            this.prisma.user.count(),
        ]);
        return { messages, tasksCompleted: tasks, activeUsers: users };
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map