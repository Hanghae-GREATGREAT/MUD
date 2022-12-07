import { MessagePort } from 'worker_threads'
import { UserStatus } from './user';

export interface AutoWorkerData {
    [key: string]: MessagePort|number|string|UserStatus;
    userStatus: UserStatus;
    path: string;
}

export interface AutoWorkerResult {
    status: 'monster'|'player'|'terminate'|'continue';
    script: string;
}

export interface IsDeadReceiver {
    [key: string]: MessagePort;
}