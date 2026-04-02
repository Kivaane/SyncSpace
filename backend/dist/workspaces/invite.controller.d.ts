import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
export declare class InviteController {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: RealtimeGateway);
    invite(workspaceId: number, data: {
        email: string;
        role?: string;
    }, req: any): Promise<{
        success: boolean;
        invite: {
            id: number;
            workspaceId: number;
            email: string;
            role: string;
            createdAt: Date;
        };
    }>;
}
