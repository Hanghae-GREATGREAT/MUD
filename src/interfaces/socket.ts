import { Monsters } from '../db/models';
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

// import { Socket } from 'socket.io';

// interface ASIMessage {
//     messageId: number;
//     asi: string;
//     params: any;
// }
// type ASICallback = (socket: Socket, userInfo: any, params: any) => void;

// export { ASIMessage, ASICallback }

// export enum MessageSource {
//     normal = 'normal',  // others
//     self = 'self',
//     system = 'system'
// }

// export enum MessageType {
//     request = 'request',
//     response = 'response',
//     event = 'event'
// }

// export enum MessageEventName {
//     response = 'response',
//     chatting = 'chatting'
// }

// export enum ResultState {
//     success = 'success',
//     error = 'error'
// }
