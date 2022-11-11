import morgan, { StreamOptions } from 'morgan';
import Logger from '../utils/logger';
// import env from '../config.env';


class Morgan {

    private readonly stream: StreamOptions;
    readonly middleware;

    constructor() {
        this.stream = {
            write: (message) => Logger.http(message),
        };
        this.middleware = morgan(
            ':method :url :status :res[content-length] - :response-time ms',
            { stream: this.stream }
        );
    }
}

// unnecessary since NODE_ENV already checked by winston at /utils/logger.ts
// const skip = () => {
//     return env.NODE_ENV !== 'development';
// }


export default new Morgan();