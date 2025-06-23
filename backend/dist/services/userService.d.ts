import { User, CreateUserData, UserResponse } from '@/types/user';
export declare class UserService {
    createUser(userData: CreateUserData): Promise<UserResponse>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: string): Promise<UserResponse | null>;
    validatePassword(password: string, passwordHash: string): Promise<boolean>;
    updateLastLogin(id: string): Promise<void>;
}
export declare const userService: UserService;
//# sourceMappingURL=userService.d.ts.map