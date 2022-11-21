import { UserCache } from './user';

interface LineInput {
    line: string;
    userCache: UserCache;
    option: string | undefined;
}

interface ReturnScript {
    script: string;
    userCache: UserCache;
    field: string;
    chat?: boolean;
    cooldown?: number;
    error?: boolean | Error;
}

type commandHandler = (
    CMD: string,
    userCache: UserCache,
    ...args: any[]
) => ReturnScript | Promise<ReturnScript>;

interface CommandRouter {
    [key: string]: commandHandler;
}

type commandHandlerP = (
    CMD: string,
    userCache: UserCache,
    ...args: any[]
) => Promise<ReturnScript>;

interface CommandRouterP {
    [key: string]: commandHandlerP;
}


type BattleReport = (user: UserCache, script: string) => Promise<void>

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

export {
    LineInput,
    ReturnScript,
    CommandRouter,
    CommandRouterP,
    BattleResult,
    ChatInput,
    ChatOutput,
};