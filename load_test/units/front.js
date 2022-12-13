
module.exports = (socket, WAIT_COMMAND) => {

    const chatCnt = new Map();

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
            socket.once('signout',  (res) => {
                resolve({ ...res, throughput: performance.now() - start });
            });
    
            socket.once('disconnect', () => {reject(socket.connected)});
        });
    }

    const submit = async(field, input) => {
        const username = input?.name;
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            const start = performance.now();

            socket.emit(field, input);

            socket.once('chat', (script) => {
                let cnt = chatCnt.get(username);
                chatCnt.set(username, ++cnt);
                resolve({ script, throughput: performance.now() - start });
            });
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    const joinChat = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {

            socket.once('joinChat',  (username, joinerCntScript) => {
                resolve({ username, joinerCntScript });
            });
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    return {
        signin: async(username) => {
            try {
                let userInfo = {};
                let userStatus = {};
                let option = '';
                const throughput = [];
    
                const res1 = await emit('front', { line: 'in', userInfo, userStatus });
                throughput.push(res1.throughput);
            
                const res2 = await emit('sign', { line: username, userInfo, userStatus, option: '20' });
                throughput.push(res2.throughput);
                userInfo = res2.userInfo;
        
                joinChat().then((res) => {
                    // console.log(`${username} CHAT JOINED`);
                    chatCnt.set(username, 0);
                }).catch(err => console.error(err));
    
                const res3 = await emit('sign', { line: 'qwe123', userInfo, userStatus, option: '21' });
                throughput.push(res3.throughput);
                userInfo = res3.userInfo;
                userStatus = res3.userStatus;
                const field = res3.field;
        
                return { field, userInfo, userStatus, cnt: 3, throughput };
            } catch (error) {
                console.log('ERROR: signin');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },    
        signup: async(username) => {
            console.log(username);
            try {
                let userInfo = {};
                let userStatus = {};
                let option = '';
                const throughput = [];
    
                const r1 = await emit('front', { line: 'up', userInfo, userStatus });
                throughput.push(r1.throughput);
    
                const r2 = await emit('sign', { line: username, userInfo, userStatus, option: '10' });
                throughput.push(r2.throughput);
                userInfo = r2.userInfo;
    
                const r3 = await emit('sign', { line: 'qwe123', userInfo, userStatus, option: '11' });
                throughput.push(r3.throughput);
                userInfo = r3.userInfo;
    
                joinChat().then((res) => {
                    // console.log(`${username} CHAT JOINED`);
                    chatCnt.set(username, 0);
                }).catch(err => console.error(err));
    
                const r4 = await emit('sign', { line: username, userInfo, userStatus, option: '12' });
                throughput.push(r4.throughput);
                userInfo = r4.userInfo;
                userStatus = r4.userStatus;
                const field = r4.field;
    
                return { field, userInfo, userStatus, cnt: 4, throughput };
            } catch (error) {
                console.log('ERROR: signup');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        signout: async() => {
            try {
                console.log('FRONT SIGN OUT')
                const r1 = await emit('front', { line: 'out', userInfo: {}, userStatus: {} });
                console.log('SIGNOUT', r1);
                const throughput = [ r1.throughput ];
    
                const field = 'none';
                const userInfo = {};
                const userStatus = {};
        
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: signOut');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
    
        toDungeon: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('front', { line: 'd', userInfo, userStatus });
                const throughput = [ r1.throughput ];
        
                userInfo = r1.userInfo;
                field = 'dungeon';
                
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: toDungeon');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },    
        toVillage: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('front', { line: 'v', userInfo, userStatus });
                const throughput = [ r1.throughput ];
        
                userInfo = r1.userInfo;
                field = 'village';
        
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: toVillage');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
    
        toHome: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('global', { line: 'g home', userInfo, userStatus });
                const throughput = [ r1.throughput ];
    
                userInfo = r1.userInfo;
                field = 'front';
        
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: toHome');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        globalHelp: async(field, userInfo, userStatus) => {
            try {
                const r1 = await emit('global', { line: 'g help', userInfo, userStatus });
                const throughput = [ r1.throughput ];
        
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: globalHelp');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
        globalSignout: async() => {
            try {
                console.log('GLOBAL SIGNOUT');
                const r1 = await emit('global', { line: 'g out', userInfo, userStatus });
                const throughput = [ r1.throughput ];
        
                const field = 'none';
                const userInfo = {};
                const userStatus = {};
                console.log('SIGNOUT SUCCESS');
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: globalSignout');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
    
        delete: async() => {
            try {
                const r1 = await emit('front', { line: 'delete', userInfo, userStatus });
                const throughput = [ r1.throughput ];
        
                const field = 'none';
                const userInfo = {};
                const userStatus = {};
        
                return { field, userInfo, userStatus, cnt: 1, throughput };
            } catch (error) {
                console.log('ERROR: account delete');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },

        chatSubmit: async(name, message) => {
            // console.log('send', name, message);
            try {
                const input = { name, message }
                const r1 = await submit('submit', input);
                const throughput = [ r1.throughput ];

                return { ...r1, throughput, cnt: 1, chatCnt: chatCnt.get(name) };
            } catch (error) {
                console.log('ERROR: chatSubmit');
                console.error(error);
                return { cnt: 0, throughput: [], error: true };
            }
        },
    }
}