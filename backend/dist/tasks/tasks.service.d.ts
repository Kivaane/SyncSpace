import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class TasksService {
    private prisma;
    private realtimeService;
    private realtimeGateway;
    constructor(prisma: PrismaService, realtimeService: RealtimeService, realtimeGateway: RealtimeGateway);
    create(workspaceId: number, title: string, userId: number, assigneeId?: number): Promise<{
        assignee: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        workspaceId: number;
        title: string;
        status: string;
        order: number;
        assigneeId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTask(taskId: number, data: {
        status?: string;
        order?: number;
        assigneeId?: number;
        workspaceId: number;
        userId: number;
    }): Promise<{
        assignee: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        workspaceId: number;
        title: string;
        status: string;
        order: number;
        assigneeId: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllByWorkspace(workspaceId: number): Promise<({
        assignee: {
            id: number;
            name: string;
        } | null;
    } & {
        id: number;
        workspaceId: number;
        title: string;
        status: string;
        order: number;
        assigneeId: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    deleteTask(taskId: number, workspaceId: number, userId: number): Promise<{
        success: boolean;
    }>;
}
