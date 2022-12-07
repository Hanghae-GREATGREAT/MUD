import { UserInfo, UserStatus } from "./user";


export interface PostBody {
    socketId: string;
    CMD: string;
    userInfo: UserInfo;
    userStatus: UserStatus;
    option?: string;
}