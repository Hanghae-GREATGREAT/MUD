module.exports = (socket, WAIT_COMMAND) => {

    const sleep = (seconds) => {
        return new Promise((resolve) => setTimeout(resolve, 1000 * seconds));
    }

    const emit = async(field, input) => {
        await sleep(WAIT_COMMAND);

        return new Promise( (resolve, reject) => {
            socket.emit(field, input);
    
            socket.on('print', resolve);
            socket.on('printBattle', resolve);
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    const battleResult = (userInfo, userStatus, seconds) => {
        const start = Date.now();

        return new Promise((resolve, reject) => {
            socket.on('printBattle', async(res) => {
                const time = Date.now() - start;
                const field = res.field;
                userStatus = res.userStatus;

                if (field === 'heal') {
    
                    resolve({ field, userInfo, userStatus });
                }
                if (time > seconds * 1000) {
                    emit('autoBattle', { line: '중단', userInfo, userStatus }).then((res) => {
                        userInfo = res.userInfo;
                        const field = 'dungeon';
    
                        resolve({ field, userInfo, userStatus });
                    });
                    socket.off('printBattle');
                }
            });
        });
    }

    return {
        encounter: async(field, userInfo, userStatus) => {
            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';

            await emit('dungeon', { line, userInfo, userStatus });
            field = 'battle';

            return { field, userInfo, userStatus };
        },
        encounterFromList: async(field, userInfo, userStatus) => {
            console.log('normal');

            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';

            await emit('dungeon', { line, userInfo, userStatus });
    
            const res = await emit('battle', { line: '수동', userInfo, userStatus });
            userInfo = res.userInfo;
            field = res.field;

            return { field, userInfo, userStatus };
        },

        auto: async(field, userInfo, userStatus, seconds) => {
            await emit('battle', { line: '자동', userInfo, userStatus });
    
            return await battleResult(userInfo, userStatus, seconds);
        },
        autoFromList: async(field, userInfo, userStatus, seconds) => {
            console.log('autoFromList');
    
            const { level } = userStatus;
            const dungeonLevel = (level / 10)|0 + 1;
            const line = dungeonLevel <= 5 ? `입장 ${dungeonLevel}` : '입장 5';
    
            await emit('dungeon', { line, userInfo, userStatus });
    
            await emit('battle', { line: '자동', userInfo, userStatus });
    
            return await battleResult(userInfo, userStatus, seconds);
        },

        dungeonList: async(field, userInfo, userStatus) => {
            await emit('dungeon', { line: '목록', userInfo, userStatus });
            field = 'dungeon';

            return { field, userInfo, userStatus };
        },
        dungeonHelp: async(field, userInfo, userStatus) => {
            await emit('dungeon', { line: '도움말', userInfo, userStatus });
            field = 'dungeon';

            return { field, userInfo, userStatus };
        },
        dungeonWrong: async(field, userInfo, userStatus) => {
            await emit('dungeon', { line: '', userInfo, userStatus });
            field = 'dungeon';

            return { field, userInfo, userStatus };
        },
    }
    
}