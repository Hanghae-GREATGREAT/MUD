import httpServer from './src/app';
import env from './src/config.env';

httpServer.listen(env.PORT, env.HOST, () => {
    console.log(env.NODE_ENV);
    console.log(`SERVER RUNNING ON '${env.HOST}:${env.PORT}'`);
});