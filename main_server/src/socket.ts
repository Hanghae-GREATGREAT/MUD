import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import env from './config.env';
import { io } from './app';

const { REDIS_URL } = env;
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();
Promise.all([pubClient.connect(), subClient.connect()]).then(async() => {
    io.adapter(createAdapter(pubClient, subClient));
});

export {
    pubClient, subClient
}