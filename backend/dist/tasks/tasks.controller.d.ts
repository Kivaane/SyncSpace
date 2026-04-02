import { TasksService } from './tasks.service';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    create(workspaceId: number, data: {
        title: string;
        assigneeId?: number;
    }, req: any): Promise<{
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
    update(workspaceId: number, id: number, data: {
        status?: string;
        order?: number;
        assigneeId?: number;
    }, req: any): Promise<{
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
    delete(workspaceId: number, id: number, req: any): Promise<{
        success: boolean;
    }>;
    getAll(workspaceId: number): Promise<({
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
}
