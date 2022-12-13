
module.exports = (socket, WAIT_COMMAND) => {

    const rooms = new Map();
    
    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();
            socket.emit(field, input);
    
            socket.once('print', (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
            socket.once('printBattle',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.once('disconnect', () => {reject(socket.connected)});
        });
    }

    return {
        npcHelp: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '도움말', userInfo, userStatus, option: 'pvpNpc' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        npcTalk: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '1', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        pvpEnter: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '2', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        npcReturn: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '3', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'village', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        npcWrong: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '', userInfo, userStatus, option: 'pvpNpc' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpNpc', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        listHelp: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '도움말', userInfo, userStatus, option: 'pvpList' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        listRefresh: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '새', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        listReturn: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '돌', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpNpc', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        roomCreate: async(field, userInfo, userStatus) => {
            try {
                const roomId = userInfo.characterId;
                rooms.set(roomId, 1);
    
                const input = { line: `1 ${roomId}`, userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        roomJoin: async(field, userInfo, userStatus) => {
            try {
                const roomList = rooms.entries();
                let roomId = -1;
                let line = '';
                for (const room of roomList) {
                    if (room[1] < 4) {
                        roomId = room[0];
                        rooms.set(roomId, ++room[1]);
                        line = `2 ${roomId}`;
                        break;
                    }
                }
                if (roomId === -1) {
                    roomId = userInfo.characterId;
                    rooms.set(roomId, 1);
                    line = `1 ${roomId}`;
                }
    
                const input = { line, userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        listWrong: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '', userInfo, userStatus, option: 'pvpList' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        joinHelp: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '도움말', userInfo, userStatus, option: 'pvpJoin' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        joinReturn: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '돌', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        joinWrong: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '', userInfo, userStatus, option: 'pvpJoin' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        joinRefresh: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '현', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        battleHelp: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '도움말', userInfo, userStatus, option: 'pvpBattle' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        battleWrong: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '', userInfo, userStatus, option: 'pvpBattle' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        battleStatus: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '상', userInfo, userStatus }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        battleAttack: async(field, userInfo, userStatus) => {
            try {
                const input = { line: '', userInfo, userStatus, option: 'pvpBattle' }
                const r1 = await emit(field, input);
                const throughput = [ r1.throughput ];
    
                return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        
    }
}