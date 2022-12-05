
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

    return {
        talk: async(field, userInfo, userStatus) => {
            await emit(field, { line: '1', userInfo, userStatus });

            return { field, userInfo, userStatus, cnt: 1 };
        },
        return: async(field, userInfo, userStatus) => {
            await emit(field, { line: '3', userInfo, userStatus });
            field = 'village';

            return { field, userInfo, userStatus, cnt: 1 };
        },
        help: async(field, userInfo, userStatus) => {
            await emit(field, { line: '도움말', userInfo, userStatus });

            return { field, userInfo, userStatus, cnt: 1 };
        },

        toStory: async(field, userInfo, userStatus) => {
            await emit('village', { line: '1', userInfo, userStatus });
            field = 'story';

            return { field, userInfo, userStatus, cnt: 1 };
        },
        story: async(field, userInfo, userStatus) => {
            await emit('story', { line: '2', userInfo, userStatus });
            field = 'story';

            return { field, userInfo, userStatus, cnt: 1 };
        },

        toHeal: async(field, userInfo, userStatus) => {
            await emit('village', { line: '2', userInfo, userStatus });
            field = 'heal';

            return { field, userInfo, userStatus, cnt: 1 };
        },
        heal: async(field, userInfo, userStatus) => {
            const res = await emit('heal', { line: '2', userInfo, userStatus });
            userInfo = res.userInfo;
            userStatus = res.userStatus;
            field = res.field;

            return { field, userInfo, userStatus, cnt: 1 };
        },

        toEnhance: async(field, userInfo, userStatus) => {
            await emit('village', { line: '3', userInfo, userStatus });
            field = 'enhance';

            return { field, userInfo, userStatus, cnt: 1 };
        },
        enhance: async(field, userInfo, userStatus) => {
            await emit('enhance', { line: '2', userInfo, userStatus });
            field = 'enhance';

            return { field, userInfo, userStatus, cnt: 1 };
        },

        toGamble: async(field, userInfo, userStatus) => {
            await emit('village', { line: '4', userInfo, userStatus });
            field = 'gamble';

            return { field, userInfo, userStatus, cnt: 1 };
        },
        gamble: async(field, userInfo, userStatus) => {
            await emit('gamble', { line: '2', userInfo, userStatus });
            field = 'gamble';

            return { field, userInfo, userStatus, cnt: 1 };
        },

        toPvp: async(field, userInfo, userStatus) => {
            await emit('village', { line: '5', userInfo, userStatus });
            field = 'pvp';

            return { field, userInfo, userStatus, cnt: 1 };
        },
    }
}