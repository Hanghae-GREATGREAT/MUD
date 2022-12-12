import { MessagePort } from 'worker_threads'
import { UserStatus } from './user';

export interface AutoWorkerData {
    [key: string]: MessagePort|number|string|UserStatus;
    userStatus: UserStatus;
    path: string;
    socketId: string;
}

export interface AutoWorkerResult {
    status: 'monster'|'player'|'continue'|'terminate'|'error';
    script: string;
}

export interface IsDeadReceiver {
    [key: string]: MessagePort;
}