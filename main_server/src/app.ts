import env from './config.env';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { battleConnection, onConnection } from './socket.routes';

import sequelize from './db/config/connection';
import associate from './db/config/associate';

import apiRouter from './api.routes';
import error from './middlewares/errorhandlers';


const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: env.CLIENT_URL,
        methods: 'POST, GET',
    }
});

io.use((socket, next)=>{next()})
// io.use(SocketMiddleware)
io.on('connection', onConnection);

const battleNamespace = io.of('/battle');
battleNamespace.on('connection', battleConnection);


if (env.NODE_ENV !== 'test') {
    sequelize.authenticate().then(() => {
        associate();
        console.log('DB CONNECTED');
    }).catch((error) => {
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