
module.exports = (socket, WAIT_COMMAND) => {
    
    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        // console.log(`[${new Date(Date.now()+1000*60*60*9)}]`, 'emit...', input?.userInfo?.characterId);
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
            try {
                const r1 = await emit(field, { line: '1', userInfo, userStatus });
                const throughput = [ r1.throughput ];
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('talk error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        return: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit(field, { line: '3', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'village';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('return error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        help: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit(field, { line: '도움말', userInfo, userStatus });
                const throughput = [ r1.throughput ];
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('help error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        toStory: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('village', { line: '1', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'story';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('toStory error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        story: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('story', { line: '2', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'story';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        toHeal: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('village', { line: '2', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'heal';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
                
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        heal: async(field, userInfo, userStatus) => {
            try {
                const res = await emit('heal', { line: '2', userInfo, userStatus });
                const throughput = [ res.throughput ];
    
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                field = res.field;
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        toEnhance: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('village', { line: '3', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'enhance';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        enhance: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('enhance', { line: '2', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'enhance';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        toGamble: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('village', { line: '4', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'gamble';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
        gamble: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('gamble', { line: '2', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'gamble';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },

        toPvp: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('village', { line: '5', userInfo, userStatus });
                const throughput = [ r1.throughput ];
                field = 'pvp';
    
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('error')
                return { cnt: 0, throughput: [], error: true };
            }
        },
    }
}