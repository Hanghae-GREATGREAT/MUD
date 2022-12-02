import httpServer from './src/app';
import env from './src/config.env';

httpServer.listen(env.PORT, () => {
    console.log(env);
    console.log(`SERVER RUNNING ON`, httpServer.address());
});