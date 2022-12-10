


const createClient = async(id) => {
    const username = `user${id}`

    const URL = 'great-effect33.com:3333';
    const { io } = require('socket.io-client');
    const mainSocket = io(`ws://${URL}/`, { transports: ['websocket'] });
    const frontSocket = io(`ws://${URL}/front`, { transports: ['websocket'] });
    const battleSocket = io(`ws://${URL}/battle`, { transports: ['websocket'] });
    const pvpSocket = io(`ws://${URL}/pvp`, { transports: ['websocket'] });

    const END = () => {
        mainSocket.disconnect();
        frontSocket.disconnect();
        battleSocket.disconnect();
        console.log(username, mainSocket.disconnected, frontSocket.disconnected, battleSocket.disconnected);
    }

    const WAIT_COMMAND = Math.random()*1 + 0.5;
    const front = require('./units/front')(frontSocket, WAIT_COMMAND);
    const village = require('./units/village')(mainSocket, WAIT_COMMAND);
    const battle = require('./units/battle')(battleSocket, WAIT_COMMAND);
    const pvp = require('./units/pvp')(pvpSocket, WAIT_COMMAND);
    const fields = { front, battle, village, pvp };
    const selector = require('./units/selector')(fields);

    let emitCount = 0;
    const throughputs = [];
    let chatLoop = undefined;

    try {
        const start = Date.now();
        
        // SIGN IN / OUT
        const SIGN = Math.round(Math.random());
        const username = SIGN === 0 ? `user${id}` : 'user'+`${Date.now()*id}`.slice(3,13);
        console.log(username);
        const res = await selector.sign[SIGN](username);
        let { field, userInfo, userStatus, cnt, throughput } = res;
        emitCount += cnt;
        throughputs.push(...throughput);

        chatLoop = setInterval(() => {
            if (Math.random() < 0.80) return;
            front.chatSubmit(username, 'chatchat').then((res) => {
                throughputs.push(...res.throughput);
                emitCount++;
                console.log(res.script);
            })
        }, 3000);
    
        while (true) {
            const FIELD = Math.random() < 0.9 ?
                selector[field] : selector['global'];
            const SELECT = (Math.random()*FIELD.length)|0;
            
            console.log(field, SELECT);
            if (field === 'battle' || (field === 'dungeon' && SELECT <= 1)) {
                const BATTLE_DURATION = (Math.random()*30 + 10)|0;
                console.log('battle duration: ', username, BATTLE_DURATION);
    
                const res = await FIELD[0](field, userInfo, userStatus, BATTLE_DURATION);
                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
            } else {
                const res = await FIELD[SELECT](field, userInfo, userStatus);
                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
            }
            
            console.log(field, userInfo.userId, userStatus.username);
    
            if (Date.now() - start > 1000*60) break;
        }
    
        console.log('break');
        console.log(emitCount, throughputs.reduce((a,b) => a+b, 0) / emitCount);
        
    } catch (error) {
        console.error(error);
    }
    clearInterval(chatLoop);
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

main(5);