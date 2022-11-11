import { Server } from 'socket.io';
import Client from 'socket.io-client';
import httpServer from '../src/app';
import redis from '../src/db/redis/config';



describe("my awesome project", () => {
    let io, serverSocket, clientSocket;

    beforeAll((done) => {
        // const httpServer = createServer();
        io = new Server(httpServer);

        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            clientSocket.on("connect", done);
        });
    });

    afterAll((done) => {
        io.close();
        clientSocket.close();
        redis.disconnect().then(async()=>{
            while (redis.status === "connected") {
                await new Promise(r => setTimeout(r, 200));
            }
            done();
        });
    });

    test("should work", (done) => {
        clientSocket.on("hello", (arg) => {
            expect(arg).toBe("world");
            done();
        });
        serverSocket.emit("hello", "world");
    });

    test("should work (with ack)", (done) => {
        serverSocket.on("hi", (cb) => {
            cb("hola");
        });

        clientSocket.emit("hi", (arg) => {
            expect(arg).toBe("hola");
            done();
        });
    });
});








// const { createServer } = require('http');
// const { Server } = require('socket.io');
// const Client = require('socket.io-client')


// describe('socket connection test', () => {
//     let io, serverSocket, clientSocket, httpServer, httpServerAddr;

//     beforeAll((done) => {
//         const httpServer = createServer()
//         io = new Server(httpServer);
//         httpServer.listen(() => {
//             httpServerAddr = httpServer.address();
//             // const port = httpServer.address().port;
//             // clientSocket = new Client(`http://localhost:${port}`);

//             io.on('connection', (socket) => {
//                 serverSocket = socket;
//                 done();
//             });
//             // clientSocket.on('connect', done);
//         });
//     });

//     afterAll((done) => {
//         io.close();
//         done();
//     });

//     beforeEach((done) => {
//         clientSocket = Client.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {
//             'reconnection delay': 0,
//             'reopen delay': 0,
//             'force new connection': true,
//             transports: ['websocket'],
//         });

//         clientSocket.on('connect', () => {
//             done();
//         }); 
//     });

//     afterEach((done) => {
//         if (clientSocket.connected) {
//             clientSocket.disconnect();
//         }
//         done();
//     });

//     test('should communicate', (done) => {
//         serverSocket.emit('echo', 'Hello World');

//         clientSocket.once('echo', (message) => {
//             expect(message).toBe('Hello World');
//             done();
//         });

//         serverSocket.on('connection', (mySocket) => {
//             expect(mySocket).toBeDefined();
//         });
//     });
//     test.skip('should communicate with waiting for socket.io handshakes', (done) => {
//         clientSocket.emit('examlpe', 'some messages');

//         setTimeout(() => {
//         // Put your server side expect() here
//             done();
//         }, 50);
//     });


//     // test('jest socket test', (done) => {
//     //     clientSocket.on('hello', (arg) => {
//     //         expect(arg).toBe('world');
//     //         done();
//     //     });
//     //     serverSocket.emit('hellow', 'world');
//     // });

//     // test('jest socket test with ack', (done) => {
//     //     serverSocket.on('hi', (cb) => {
//     //         cb('hola');
//     //     });
//     //     clientSocket.emit('hi', (arg) => {
//     //         expect(arg).toBe('hola');
//     //         done();
//     //     });
//     // });
// });