


const createClient = async(id) => {
    const username = `user${id}`

    const URL = '3.39.234.153:3333';
    const { io } = require('socket.io-client');
    const mainSocket = io(`ws://${URL}/`, { transports: ['websocket'] });
    const frontSocket = io(`ws://${URL}/front`, { transports: ['websocket'] });

    const END = () => {
        mainSocket.disconnect();
        frontSocket.disconnect();
        console.log(username, mainSocket.disconnected, frontSocket.disconnected);
    }

    const WAIT_COMMAND = Math.random()*1 + 0.5;
    const front = require('./units/front')(frontSocket, WAIT_COMMAND);

    let emitCount = 0;
    const throughputs = [];

    try {
        const start = Date.now();
        console.log('START', username);

        const res1 = await front.signin(username);
        console.log(res1);

        const res2 = await front.chatSubmit(username, 'hihihi');
        console.log(res2);

        const res3 = await front.chatSubmit(username, 'hihihi');
        console.log(res3);

        const res4 = await front.chatSubmit(username, 'hihihi');
        console.log(res4);

        const res5 = await front.chatSubmit(username, 'hihihi');
        console.log(res5);
        
    } catch (error) {
        console.error(error);
    }
    END();
    return;
}

const main = (N) => {
    let cnt = N;
    for (let i=0; i<N; i++) {
        createClient(i+1).finally(() => {
            cnt--;
        });
    }
    setInterval(() => {
        if (cnt === 0) process.exit(0);
    }, 10000);
}

main(1);
