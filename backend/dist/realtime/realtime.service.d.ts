import { PrismaService } from '../prisma/prisma.service';
export declare class RealtimeService {
    private prisma;
    constructor(prisma: PrismaService);
    saveMessage(workspaceId: number, senderId: number, content: string): Promise<{
        sender: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        workspaceId: number;
        senderId: number;
        content: string;
        createdAt: Date;
    }>;
    getMessages(workspaceId: number): Promise<({
        sender: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        workspaceId: number;
        senderId: number;
        content: string;
        createdAt: Date;
    })[]>;
    getDocument(workspaceId: number): Promise<{
        id: number;
        workspaceId: number;
        content: string;
        updatedAt: Date;
    }>;
    saveDocument(workspaceId: number, content: string): Promise<{
        id: number;
        workspaceId: number;
        content: string;
        updatedAt: Date;
    }>;
    logActivity(workspaceId: number, userId: number, type: string, content: string): Promise<{
        id: number;
        workspaceId: number;
        userId: number;
        type: string;
        content: string;
        createdAt: Date;
    }>;
    getActivities(workspaceId?: number): Promise<({
        user: {
            name: string;
        };
        workspace: {
            name: string;
        };
    } & {
        id: number;
        workspaceId: number;
        userId: number;
        type: string;
        content: string;
        createdAt: Date;
    })[]>;
    getGlobalStats(): Promise<{
        messages: number;
        tasksCompleted: number;
        activeUsers: number;
    }>;
}
