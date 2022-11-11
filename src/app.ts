import env from './config.env';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import onConnection from './socket.routes';

import path from 'path';
import ejs from 'ejs';
import sequelize from './db/config/connection';
import associate from './db/config/associate';

import apiRouter from './api.routes';
import pageRouter from './page.routes';
import error from './middlewares/errorhandlers';


const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: '*',
    }
});
io.use((socket, next)=>{next()})
// io.use(SocketMiddleware)
io.on('connection', onConnection);


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


app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'views' , 'public')));
app.use(express.json());

app.use('/', pageRouter);
app.use('/api', apiRouter);

app.use(error.logger, error.handler);


export default httpServer;