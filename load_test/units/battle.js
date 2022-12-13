


module.exports = (socket, WAIT_COMMAND) => {
let cnt = 0;
let dead = 0;
let alive = 0;
    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        // console.log(`[${new Date(Date.now()+1000*60*60*9)}]`, 'emit...', input?.userInfo?.characterId);
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();
            socket.volatile.emit(field, input);
    
            socket.once('print', (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.once('printBattle',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.once('void',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.once('disconnect', () => {reject(socket.connected)});
        });
    }

    const battleResult = (userInfo, userStatus, battle_duration) => {
        const start = Date.now();
        let flag = false;
        console.log('battleResult()', flag);
        return new Promise((resolve, reject) => {
            const result = {
                'autoBattleS': (res, time) => {
                    if (time < battle_duration * 1000) return;
    
                    flag = true;
                    alive++;
                    console.log('ALIVE SS', userInfo.characterId, flag);
                    emit('autoBattleS', { line: '중단', userInfo, userStatus }).then((res) => {
                        const field = 'dungeon';
                        resolve({ ...res, field, userInfo, userStatus });
                    }).catch((error) => {
                        console.log('battleResult Error', userInfo.characterId, error.message);
                        reject(`Error: battleResult, ${userInfo.characterId}, ${error.message}`);
                    });
                },
                'autoBattle': (res, time) => {
                    // console.log('AB INNNNNNNNNNNNNNNNNN', userInfo.characterId);
                    if (time < battle_duration * 1000) return;
    
                    flag = true;
                    alive++;
                    console.log('ALIVE', userInfo.characterId, flag);
                    emit('autoBattle', { line: '중단', userInfo, userStatus }).then((res) => {
                        console.log('전투중단 성공', userInfo.characterId);
                        const field = 'dungeon';
                        resolve({ ...res, field, userInfo, userStatus });
                    }).catch((error) => {
                        console.log('battleResult Error', userInfo.characterId, error.message);
                        reject(`Error: battleResult, ${userInfo.characterId}, ${error.message}`);
                    });
                },
                'heal': (res, time) => {
                    flag = true;
                    dead++;
                    console.log('DEAD', userInfo.characterId, flag);
                    resolve({ field: res.field, userInfo, userStatus });
                },
                'dungeon': (res, time) => {
                    flag = true;
                    console.log('BATTLE ERROR RETRUNING TO ENTRANCE', userInfo.characterId, flag);
                    resolve({ field: res.field, userInfo, userStatus });
                }
            }
            socket.on('printBattle', async(res) => {
                if (flag) return;
                const time = Date.now() - start;
                const field = res.field;
                userStatus = res.userStatus;

                result[field](res, time);
            });
        });
    }

    return {
        dungeonList: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '목록', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonList');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        enterDungeon: async(field, userInfo, userStatus) => {
            try {
                const { level } = userStatus;
                const dungeonLevel = (level / 10)|0 + 1;
                const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
    
                const r1 = await emit('dungeon', { line, userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'battle';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: enterDungeon');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        encounterFromList: async(field, userInfo, userStatus) => {
            console.log('normal');

            try {
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
            } catch (error) {
                console.log('ERROR: encounterFromList');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },

        auto: async(field, userInfo, userStatus, seconds=30) => {
            try {
                const throughput = [];
    
                const r1 = await emit('battle', { line: '자동', userInfo, userStatus });
                throughput.push(r1.throughput);
    
                const result = await battleResult(userInfo, userStatus, seconds);
                
                switch (result.field) {
                    case 'heal':
                        return { ...result, cnt: 1, throughput };
                    case 'dungeon':
                        throughput.push(result.throughput);
                        return { ...result, cnt: 2, throughput };
                }
            } catch (error) {
                console.log('ERROR: auto');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        autoFromList: async(field, userInfo, userStatus, battle_duration=30) => {
            console.log('autoFromList', userInfo.characterId);

            try {
                const { level } = userStatus;
                const dungeonLevel = (level / 10)|0 + 1;
                const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
                const throughput = [];
        
                // console.log('to dungeon', userInfo.characterId);
                const r1 = await emit('dungeon', { line, userInfo, userStatus });
                throughput.push(r1.throughput);
        
                console.log('auto start', userInfo.characterId);
                const r2 = await emit('battle', { line: '자동', userInfo, userStatus });
                throughput.push(r2.throughput);
                
                console.log('listen result', userInfo.characterId);
                const result = await battleResult(userInfo, userStatus, battle_duration);

                console.log('RESULT OUT', userInfo.characterId);
                switch (result.field) {
                    case 'heal':
                        return { ...result, cnt: 2, throughput };
                    case 'dungeon':
                        const t = result?.throughput;
                        if (t) throughput.push(t);
                        return { ...result, cnt: 3, throughput };
                    default:
                        return { ...result, cnt: 2, throughput };
                }
            } catch (error) {
                console.log('ERROR: autoFromList');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
    
        },
        quitAuto: async(field, userInfo, userStatus) => {
            console.log('quit autobattle', userInfo.characterId);
            
            emit('autoBattle', { line: '중단', userInfo, userStatus }).then((res) => {
                console.log('전투중단 성공', userInfo.characterId);
                const throughput = [ res.throughput ];
                const field = 'dungeon';

                return { field, userInfo, userStatus, cnt: 1, throughput };
            }).catch((error) => {
                console.log('battleResult Error', userInfo.characterId, error?.message);
            });
        },

        dungeonHelp: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '도움말', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonHelp');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        dungeonWrong: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('dungeon', { line: '', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'dungeon';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: dungeonWrong');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
    }
    
}