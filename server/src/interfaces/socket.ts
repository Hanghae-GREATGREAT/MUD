import { UserCache, UserInfo, UserStatus } from './user';

interface LineInput {
    line: string;
    userCache: UserCache;
    option: string | undefined;
}

interface ReturnScript {
    script: string;
    field: string;
    userCache: UserCache;
    chat?: boolean;
    cooldown?: number;
    error?: boolean | Error;
}

type commandHandlerOld = (
    CMD: string,
    userCache: UserCache,
    ...args: any[]
) => ReturnScript | Promise<ReturnScript>;

interface CommandRouter {
    [key: string]: commandHandlerOld;
}

type commandHandlerP = (
    CMD: string,
    userCache: UserCache,
    ...args: any[]
) => Promise<ReturnScript>;

interface CommandRouterP {
    [key: string]: commandHandlerP;
}


type BattleReport = (user: UserStatus, script: string) => Promise<void>

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


interface SocketInput {
    line: string;
    userInfo: UserInfo;
    userStatus: UserStatus;
    option: string | undefined;
}

type commandHandler = (
    CMD: string,
    // userInfo?: UserInfo,
    // UserStatus?: UserStatus,
    ...args: any[]
) => void | Promise<void>;

interface CommandHandler {
    [key: string]: commandHandler;
}

export {
    LineInput,
    ReturnScript,
    CommandRouter,
    CommandRouterP,
    BattleResult,
    ChatInput,
    ChatOutput,
    CommandHandler,
    SocketInput,
};