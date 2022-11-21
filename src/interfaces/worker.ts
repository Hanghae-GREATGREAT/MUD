import { MessagePort } from 'worker_threads'
import { UserCache } from './user';

export interface AutoWorkerData {
    [key: string]: MessagePort|number|string|UserCache;
    userCache: UserCache;
    path: string;
}

export interface AutoWorkerResult {
    status: 'monster'|'player'|'terminate'|'continue';
    script: string;
}

export interface IsDeadReceiver {
    [key: string]: MessagePort;
}

export interface IsDeadResult {
    isDead: 'monster'|'player'|'terminate';
    script: string;
}

