import { MessagePort } from 'worker_threads'
import { UserStatus } from './user';

export interface PvpUsersWorkerData {
    [key: string]: MessagePort|number|string|UserStatus;
    userStatus: UserStatus;
    path: string;
}

export interface pvpUsersWorkerResult {
    script: string;
    userStatus: UserStatus;
}

// export interface PvpUsersWorkerTimer {
//     isPause: boolean;
//     timer: NodeJS.Timer;
// }

export interface IsDeadReceiver {
    [key: string]: MessagePort;
}