const { io } = require('socket.io-client');
const URL = 'ws://localhost:3333/';
const mainSocket = io(URL, { transports: ['websocket'] });
const battleSocket = io(URL+'battle', { transports: ['websocket'] });

const END = () => {
    mainSocket.disconnect();
    battleSocket.disconnect();
    process.exit(0);
}
const WAIT_COMMAND = Math.random()*3 + 0.5;

const main = require('./units/front')(mainSocket, WAIT_COMMAND);
const battle = require('./units/battle')(battleSocket, WAIT_COMMAND);
const village = require('./units/village')(mainSocket, WAIT_COMMAND);
const fields = { main, battle, village }
const field = require('./units/selector')(fields);


field.sign[1]('prac134').then((result) => {
    console.log(result);
    END();
});
console.log('ASYNC')
