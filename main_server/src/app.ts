import env from './config.env';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { frontConnection, battleConnection, pvpConnection, onConnection } from './socket.routes';
import { pubClient, subClient } from './socket';
import apiRouter from './api.routes';
import error from './middlewares/errorhandlers';
import sequelize from './db/config/connection';
import associate from './db/config/associate';


const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: env.CLIENT_SOCKET,
        methods: 'POST, GET',
    },
});
io.use((socket, next) => {
    next();
});
// io.use(SocketMiddleware)
io.on('connection', onConnection);
pubClient.on('connect', () => console.log('REDIS PUB CONNECTED'));
subClient.on('connect', () => console.log('REDIS SUB CONNECTED'));

const frontNameSpace = io.of('/front');
frontNameSpace.on('connection', frontConnection);
const battleNamespace = io.of('/battle');
battleNamespace.on('connection', battleConnection);
const pvpNamespace = io.of('/pvp');
pvpNamespace.on('connection', pvpConnection);


if (env.NODE_ENV !== 'test') {
    sequelize
        .authenticate()
        .then(() => {
            associate();
            console.log('DB CONNECTED');
        })
        .catch((error) => {
            console.error(error);
            console.log('DB CONNECTION FAIL');

            process.exit(0);
        });
}


app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Headers': 'XMLHttpRequest,Content-Type',
        'Access-Control-Allow-Methods': 'POST,GET',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Private-Network': true,
    });
    next();
});

app.use(express.json());
app.use('/api', apiRouter);

app.use(error.logger, error.handler);


export default httpServer;
export { io };