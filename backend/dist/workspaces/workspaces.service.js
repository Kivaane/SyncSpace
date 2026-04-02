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
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspacesService = class WorkspacesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(name, userId) {
        return this.prisma.workspace.create({
            data: {
                name,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } }
            }
        });
    }
    async findAll() {
        return this.prisma.workspace.findMany({
            include: {
                members: { include: { user: { select: { id: true, name: true } } } }
            }
        });
    }
    async findOne(id) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { id },
            include: {
                members: { include: { user: { select: { id: true, name: true } } } },
                owner: { select: { id: true, name: true } }
            }
        });
        if (!workspace)
            throw new common_1.NotFoundException('SyncNode not found');
        return workspace;
    }
    async getMessages(workspaceId) {
        return this.prisma.message.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } }
        });
    }
    async join(workspaceId, userId) {
        const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
        if (!workspace)
            throw new common_1.NotFoundException('Workspace not found');
        const existingMember = await this.prisma.member.findUnique({
            where: { userId_workspaceId: { userId, workspaceId } },
        });
        if (existingMember)
            throw new common_1.BadRequestException('Already a member');
        return this.prisma.member.create({
            data: {
                userId,
                workspaceId,
                role: 'member',
            },
            include: {
                workspace: true
            }
        });
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map