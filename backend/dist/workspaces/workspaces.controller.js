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
exports.WorkspacesController = void 0;
const common_1 = require("@nestjs/common");
const workspaces_service_1 = require("./workspaces.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspacesController = class WorkspacesController {
    workspacesService;
    prisma;
    constructor(workspacesService, prisma) {
        this.workspacesService = workspacesService;
        this.prisma = prisma;
    }
    async create(req, name) {
        return this.workspacesService.create(name, req.user.id);
    }
    async getAll() {
        return this.workspacesService.findAll();
    }
    async search(q) {
        if (!q)
            return { messages: [], tasks: [], users: [] };
        const [messages, tasks, users] = await Promise.all([
            this.prisma.message.findMany({
                where: { content: { contains: q } },
                include: { sender: { select: { name: true } } },
                take: 5
            }),
            this.prisma.task.findMany({
                where: { title: { contains: q } },
                take: 5
            }),
            this.prisma.user.findMany({
                where: { name: { contains: q } },
                select: { id: true, name: true, email: true },
                take: 5
            })
        ]);
        return { messages, tasks, users };
    }
    async getOne(id) {
        return this.workspacesService.findOne(id);
    }
    async getMessages(id) {
        return this.workspacesService.getMessages(id);
    }
};
exports.WorkspacesController = WorkspacesController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkspacesController.prototype, "getMessages", null);
exports.WorkspacesController = WorkspacesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workspace'),
    __metadata("design:paramtypes", [workspaces_service_1.WorkspacesService,
        prisma_service_1.PrismaService])
], WorkspacesController);
//# sourceMappingURL=workspaces.controller.js.map