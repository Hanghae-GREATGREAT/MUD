
module.exports = (socket, WAIT_COMMAND) => {
    
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
        talk: async(field, userInfo, userStatus) => {
            const r1 = await emit(field, { line: '1', userInfo, userStatus });
            const throughput = [ r1.throughput ];

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        return: async(field, userInfo, userStatus) => {
            const r1 = await emit(field, { line: '3', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'village';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        help: async(field, userInfo, userStatus) => {
            const r1 = await emit(field, { line: '도움말', userInfo, userStatus });
            const throughput = [ r1.throughput ];

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },

        toStory: async(field, userInfo, userStatus) => {
            const r1 = await emit('village', { line: '1', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'story';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        story: async(field, userInfo, userStatus) => {
            const r1 = await emit('story', { line: '2', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'story';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },

        toHeal: async(field, userInfo, userStatus) => {
            const r1 = await emit('village', { line: '2', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'heal';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        heal: async(field, userInfo, userStatus) => {
            const res = await emit('heal', { line: '2', userInfo, userStatus });
            const throughput = [ res.throughput ];

            userInfo = res.userInfo;
            userStatus = res.userStatus;
            field = res.field;

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },

        toEnhance: async(field, userInfo, userStatus) => {
            const r1 = await emit('village', { line: '3', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'enhance';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        enhance: async(field, userInfo, userStatus) => {
            const r1 = await emit('enhance', { line: '2', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'enhance';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },

        toGamble: async(field, userInfo, userStatus) => {
            const r1 = await emit('village', { line: '4', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'gamble';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
        gamble: async(field, userInfo, userStatus) => {
            const r1 = await emit('gamble', { line: '2', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'gamble';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },

        toPvp: async(field, userInfo, userStatus) => {
            const r1 = await emit('village', { line: '5', userInfo, userStatus });
            const throughput = [ r1.throughput ];
            field = 'pvp';

            return { field, userInfo, userStatus, cnt: 1, throughput };
        },
    }
}