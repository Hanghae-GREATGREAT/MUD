
module.exports = (socket, WAIT_COMMAND) => {

    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();
            socket.emit(field, input);
    
            socket.on('print', (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.on('printBattle',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.on('signout',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    return {
        signin: async(username) => {
            let userInfo = {};
            let userStatus = {};
            let option = '';
            const throughput = [];
    
            const res1 = await emit('front', { line: 'in', userInfo, userStatus });
            throughput.push(res1.throughput);
        
            const res2 = await emit('sign', { line: username, userInfo, userStatus, option: '20' });
            throughput.push(res2.throughput);
            userInfo = res2.userInfo;
    
            const res3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '21' });
            throughput.push(res3.throughput);
            userInfo = res3.userInfo;
            userStatus = res3.userStatus;
            const field = res3.field;
    
            return { field, userInfo, userStatus, cnt: 3, throughput };
        },    
        signup: async(username) => {
            let userInfo = {};
            let userStatus = {};
            let option = '';
            const throughput = [];

            const r1 = await emit('front', { line: 'up', userInfo, userStatus });
            throughput.push(r1.throughput);

            const r2 = await emit('sign', { line: username, userInfo, userStatus, option: '10' });
            throughput.push(r2.throughput);
            userInfo = r2.userInfo;

            const r3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '11' });
            throughput.push(r3.throughput);
            userInfo = r3.userInfo;

            const r4 = await emit('sign', { line: username, userInfo, userStatus, option: '12' });
            throughput.push(r4.throughput);
            userInfo = r4.userInfo;
            userStatus = r4.userStatus;
            const field = r4.field;

            return { field, userInfo, userStatus, cnt: 4, throughput };
        },
        signout: async() => {
            const r1 = await emit('front', { line: 'out', userInfo: {}, userStatus: {} });
            const throughput = [ r1.throughput ];

            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
    
        toDungeon: async(field, userInfo, userStatus) => {
            const r1 = await emit('front', { line: 'd', userInfo, userStatus });
            const throughput = [ r1.throughput ];
    
            userInfo = r1.userInfo;
            field = 'dungeon';
            
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },    
        toVillage: async(field, userInfo, userStatus) => {
            const r1 = await emit('front', { line: 'v', userInfo, userStatus });
            const throughput = [ r1.throughput ];
    
            userInfo = r1.userInfo;
            field = 'village';
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
    
        toHome: async(field, userInfo, userStatus) => {
            const r1 = await emit('global', { line: 'g home', userInfo, userStatus });
            const throughput = [ r1.throughput ];

            userInfo = r1.userInfo;
            field = 'front';
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        globalHelp: async(field, userInfo, userStatus) => {
            const r1 = await emit('global', { line: 'g help', userInfo, userStatus });
            const throughput = [ r1.throughput ];
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        globalSignout: async() => {
            const r1 = await emit('global', { line: 'g out', userInfo, userStatus });
            const throughput = [ r1.throughput ];
    
            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
    
        delete: async() => {
            const r1 = await emit('front', { line: 'delete', userInfo, userStatus });
            const throughput = [ r1.throughput ];
    
            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus, cnt: 1, throughput };
        }
    }
}