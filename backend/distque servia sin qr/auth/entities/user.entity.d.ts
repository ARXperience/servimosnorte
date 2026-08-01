export declare enum UserRole {
    ADMIN = "ADMIN",
    TECHNICIAN = "TECHNICIAN"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
