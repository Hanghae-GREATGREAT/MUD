import { createClient } from 'redis';
import { Emitter } from '@socket.io/redis-emitter';
import env from './env';

const { REDIS_URL } = env;
const redisClient = createClient({ url: REDIS_URL });

redisClient.connect();
const io = new Emitter(redisClient);

export const FRONT = io.of('/front');
export const CHAT = io.of('/chat');
