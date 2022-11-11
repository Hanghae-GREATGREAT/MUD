import { UserSession } from './user';

interface LineInput {
    line: string;
    user: UserSession;
    option: string | undefined;
}

interface ReturnScript {
    script: string;
    user: UserSession;
    field: string;
    chat?: boolean;
}

type commandHandler = (
    CMD: string,
    user: UserSession,
    ...args: any[]
) => ReturnScript | Promise<ReturnScript>;

interface CommandRouter {
    [key: string]: commandHandler;
}

interface ChatInput {
    name: string;
    message: string;
    field: string;
}

interface ChatOutput {
    output: string;
}

interface BattleLoop {
    [key: string]: NodeJS.Timer;
}

export {
    LineInput,
    ReturnScript,
    CommandRouter,
    ChatInput,
    ChatOutput,
    BattleLoop,
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
