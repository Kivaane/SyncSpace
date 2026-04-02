import { PrismaService } from '../prisma/prisma.service';
export declare class WorkspacesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, userId: number): Promise<{
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
    findAll(): Promise<({
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
    findOne(id: number): Promise<{
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
    getMessages(workspaceId: number): Promise<({
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
    join(workspaceId: number, userId: number): Promise<{
        workspace: {
            id: number;
            name: string;
            ownerId: number;
        };
    } & {
        id: number;
        userId: number;
        workspaceId: number;
        role: string;
    }>;
}
