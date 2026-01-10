export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'CUSTOMER' | 'ADMIN' | 'VENDOR';
    createdAt: Date;
}
