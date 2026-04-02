import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WorkspacesController {
    private workspacesService;
    private prisma;
    constructor(workspacesService: WorkspacesService, prisma: PrismaService);
    create(req: any, name: string): Promise<{
        members: ({
            user: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            userId: number;
            workspaceId: number;
            role: string;
        })[];
    } & {
        id: number;
        name: string;
        ownerId: number;
    }>;
    getAll(): Promise<({
        members: ({
            user: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            userId: number;
            workspaceId: number;
            role: string;
        })[];
    } & {
        id: number;
        name: string;
        ownerId: number;
    })[]>;
    search(q: string): Promise<{
        messages: ({
            sender: {
                name: string;
            };
        } & {
            id: number;
            workspaceId: number;
            senderId: number;
            content: string;
            createdAt: Date;
        })[];
        tasks: {
            id: number;
            workspaceId: number;
            title: string;
            status: string;
            order: number;
            assigneeId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        users: {
            id: number;
            email: string;
            name: string;
        }[];
    }>;
    getOne(id: number): Promise<{
        owner: {
            id: number;
            name: string;
        };
        members: ({
            user: {
                id: number;
                name: string;
            };
        } & {
            id: number;
            userId: number;
            workspaceId: number;
            role: string;
        })[];
    } & {
        id: number;
        name: string;
        ownerId: number;
    }>;
    getMessages(id: number): Promise<({
        sender: {
            id: number;
            name: string;
        };
    } & {
        id: number;
        workspaceId: number;
        senderId: number;
        content: string;
        createdAt: Date;
    })[]>;
}
