import { MessagePort } from 'worker_threads'

export interface AutoWorkerData {
    [key: string]: MessagePort|number|string;
    characterId: number;
    path: string;
}

export interface IsDeadReceiver {
    [key: string]: MessagePort;
}
