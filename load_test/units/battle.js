


module.exports = (socket, WAIT_COMMAND) => {
let cnt = 0;
let dead = 0;
let alive = 0;
    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();
            socket.volatile.emit(field, input);
    
            socket.on('print', (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.on('printBattle',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.on('void',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    const battleResult = (userInfo, userStatus, seconds) => {
        const start = Date.now();
        let flag = false;

        return new Promise((resolve, reject) => {
            socket.on('printBattle', async(res) => {
                const time = Date.now() - start;
                const field = res.field;
                userStatus = res.userStatus;

                if (!flag && field === 'heal') {
                    flag = true;
                    dead++;
                    console.log('DEAD', userInfo.userId);
                    resolve({ field, userInfo, userStatus });
                }
                if (!flag && time > seconds * 1000) {
                    flag = true;
                    alive++;
                    console.log('ALIVE', userInfo.userId);
                    emit('autoBattleS', { line: '중단', userInfo, userStatus }).then((res) => {
                        userInfo = res.userInfo;
                        const field = 'dungeon';
    
                        resolve({ ...res, field, userInfo, userStatus });
                    });
                }
            });
        });
    }

    return {
        dungeonList: async(field, userInfo, userStatus) => {
            const r1 = await emit('dungeon', { line: '목록', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'dungeon';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        enterDungeon: async(field, userInfo, userStatus) => {
            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';

            const r1 = await emit('dungeon', { line, userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'battle';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        encounterFromList: async(field, userInfo, userStatus) => {
            console.log('normal');

            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
            const throughput = [];

            const r1 = await emit('dungeon', { line, userInfo, userStatus });
            throughput.push(r1.throughput);
    
            const r2 = await emit('battle', { line: '수동', userInfo, userStatus });
            throughput.push(r2.throughput);

            userInfo = r2.userInfo;
            field = r2.field;

            return { field, userInfo, userStatus, cnt: 2, throughput };
        },

        auto: async(field, userInfo, userStatus, seconds=30) => {
            const throughput = [];

            const r1 = await emit('battle', { line: '자동단일', userInfo, userStatus });
            throughput.push(r1.throughput);

            const result = await battleResult(userInfo, userStatus, seconds);
            
            switch (result.field) {
                case 'heal':
                    return { ...result, cnt: 1, throughput };
                case 'dungeon':
                    throughput.push(result.throughput);
                    return { ...result, cnt: 2, throughput };
            }
        },
        autoFromList: async(field, userInfo, userStatus, seconds=30) => {
            console.log('autoFromList', userInfo.userId);
    
            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
            const throughput = [];
    
            const r1 = await emit('dungeon', { line, userInfo, userStatus });
            throughput.push(r1.throughput);
    
            const r2 = await emit('battle', { line: '자동단일', userInfo, userStatus });
            throughput.push(r2.throughput);
            
            const result = await battleResult(userInfo, userStatus, seconds);
            cnt++;
            console.log('RESULT OUT', cnt);
            switch (result.field) {
                case 'heal':
                    return { ...result, cnt: 2, throughput };
                case 'dungeon':
                    throughput.push(result.throughput);
                    return { ...result, cnt: 3, throughput };
            }
        },

        dungeonHelp: async(field, userInfo, userStatus) => {
            const r1 = await emit('dungeon', { line: '도움말', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'dungeon';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        dungeonWrong: async(field, userInfo, userStatus) => {
            const r1 = await emit('dungeon', { line: '', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'dungeon';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
    }
    
}