
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
            const input = { line: '도움말', userInfo, userStatus, option: 'pvpNpc' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        npcTalk: async(field, userInfo, userStatus) => {
            const input = { line: '1', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        pvpEnter: async(field, userInfo, userStatus) => {
            const input = { line: '2', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
        },
        npcReturn: async(field, userInfo, userStatus) => {
            const input = { line: '3', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'village', userInfo, userStatus, cnt: 1, throughput };
        },
        npcWrong: async(field, userInfo, userStatus) => {
            const input = { line: '', userInfo, userStatus, option: 'pvpNpc' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpNpc', userInfo, userStatus, cnt: 1, throughput };
        },

        listHelp: async(field, userInfo, userStatus) => {
            const input = { line: '도움말', userInfo, userStatus, option: 'pvpList' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
        },
        listRefresh: async(field, userInfo, userStatus) => {
            const input = { line: '새', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
        },
        listReturn: async(field, userInfo, userStatus) => {
            const input = { line: '돌', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpNpc', userInfo, userStatus, cnt: 1, throughput };
        },
        roomCreate: async(field, userInfo, userStatus) => {
            const roomId = userInfo.userId;
            rooms.set(roomId, 1);

            const input = { line: `1 ${roomId}`, userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
        },
        roomJoin: async(field, userInfo, userStatus) => {
            const roomList = rooms.values();
            let room = roomList.next();
            while(!room.done) {
                if (room.value < 4) {
                    var roomId = room.value;
                    const n = rooms.get(roomId);
                    rooms.set(roomId, ++n);
                    break;
                }
                room = roomList.next();
            }

            const input = { line: `2 ${roomId}`, userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
        },
        listWrong: async(field, userInfo, userStatus) => {
            const input = { line: '', userInfo, userStatus, option: 'pvpList' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
        },

        joinHelp: async(field, userInfo, userStatus) => {
            const input = { line: '도움말', userInfo, userStatus, option: 'pvpJoin' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
        },
        joinReturn: async(field, userInfo, userStatus) => {
            const input = { line: '돌', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpList', userInfo, userStatus, cnt: 1, throughput };
        },
        joinWrong: async(field, userInfo, userStatus) => {
            const input = { line: '', userInfo, userStatus, option: 'pvpJoin' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
        },
        joinRefresh: async(field, userInfo, userStatus) => {
            const input = { line: '현', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpJoin', userInfo, userStatus, cnt: 1, throughput };
        },

        battleHelp: async(field, userInfo, userStatus) => {
            const input = { line: '도움말', userInfo, userStatus, option: 'pvpBattle' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
        },
        battleWrong: async(field, userInfo, userStatus) => {
            const input = { line: '', userInfo, userStatus, option: 'pvpBattle' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
        },
        battleStatus: async(field, userInfo, userStatus) => {
            const input = { line: '상', userInfo, userStatus }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
        },
        battleAttack: async(field, userInfo, userStatus) => {
            const input = { line: '', userInfo, userStatus, option: 'pvpBattle' }
            const r1 = await emit(field, input);
            const throughput = [ r1.throughput ];

            return { field: 'pvpBattle', userInfo, userStatus, cnt: 1, throughput };
        },
        
    }
}