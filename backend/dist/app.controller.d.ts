import { RealtimeService } from './realtime/realtime.service';
export declare class AppController {
    private realtimeService;
    constructor(realtimeService: RealtimeService);
    getStats(): Promise<{
        messages: number;
        tasksCompleted: number;
        activeUsers: number;
    }>;
    getActivities(): Promise<({
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
}
