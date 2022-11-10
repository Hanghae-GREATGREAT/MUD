

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    hello: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface ChatInput {
    name: string,
    message: string;
}

interface ChatOutput {
    output: string;
}

export {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    ChatInput,
    ChatOutput,
}

import { Socket } from 'socket.io';

interface ASIMessage {
    messageId: number;
    asi: string;
    params: any;
}
type ASICallback = (socket: Socket, userInfo: any, params: any) => void;



export { ASIMessage, ASICallback }


export enum MessageSource {
    normal = 'normal',  // others
    self = 'self',
    system = 'system'
}

export enum MessageType {
    request = 'request',
    response = 'response',
    event = 'event'
}

export enum MessageEventName {
    response = 'response',
    chatting = 'chatting'
}

export enum ResultState {
    success = 'success',
    error = 'error'
}