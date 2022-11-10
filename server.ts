import httpServer from './src/app';
import env from './src/config.env';

httpServer.listen(env.PORT, () => {
    console.log(env.NODE_ENV);
    console.log('SERVER RUNNING ON ', env.PORT);
});