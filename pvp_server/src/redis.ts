import { createClient } from 'redis';
import { Emitter } from '@socket.io/redis-emitter';
import env from './env';
import { redisCloud } from './db/cache';


const { REDIS_URL } = env;
const redisClient = createClient({ url: REDIS_URL });

redisClient.connect();

const io = new Emitter(redisClient);
const PVP = io.of('/pvp');

export default PVP;
