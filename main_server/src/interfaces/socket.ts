import { Socket } from 'socket.io';
import { UserCache, UserInfo, UserStatus } from './user';


interface ReturnScript {
    script: string;
    field: string;
    userCache: UserCache;
    chat?: boolean;
    cooldown?: number;
    error?: boolean | Error;
}

type BattleReport = (socket: Socket, user: UserStatus, script: string) => Promise<void>

interface BattleResult {
    [key: string]: BattleReport;
}

interface ChatInput {
    name: string;
    message: string;
    field: string;
}

interface ChatOutput {
    output: string;
}

interface ChatJoiner {
    [key: string]: string;
}

interface SocketInput {
    line: string;
    userInfo: UserInfo;
    userStatus: UserStatus;
    option: string | undefined;
}

type commandHandler = (
    socket: Socket,
    CMD: string,
    // userInfo?: UserInfo,
    // UserStatus?: UserStatus,
    ...args: any[]
) => void | Promise<void>;

interface CommandHandler {
    [key: string]: commandHandler;
}

interface CommandRouter {
    [key: string]: string;
}

export {
    ReturnScript,
    BattleResult,
    ChatInput,
    ChatOutput,
    ChatJoiner,
    CommandHandler,
    CommandRouter,
    SocketInput,
};