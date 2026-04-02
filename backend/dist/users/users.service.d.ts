import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
    } | null>;
    create(data: any): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
    }>;
    findById(id: number): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
    } | null>;
}
