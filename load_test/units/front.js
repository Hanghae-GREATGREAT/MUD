
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
            socket.on('signout', resolve);
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    return {
        signin: async(username) => {
            let userInfo = {};
            let userStatus = {};
            let option = '';
    
            await emit('front', { line: 'in', userInfo, userStatus });
        
            let r2 = await emit('sign', { line: username, userInfo, userStatus, option: '20' });
            userInfo = r2.userInfo;
    
            let r3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '21' });
            userInfo = r3.userInfo;
            userStatus = r3.userStatus;
            const field = r3.field;
    
            return { field, userInfo, userStatus };
        },    
        signup: async(username) => {
            let userInfo = {};
            let userStatus = {};
            let option = '';

            await emit('front', { line: 'up', userInfo, userStatus });

            const r2 = await emit('sign', { line: username, userInfo, userStatus, option: '10' });
            userInfo = r2.userInfo;

            const r3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '11' });
            userInfo = r3.userInfo;

            const r4 = await emit('sign', { line: username, userInfo, userStatus, option: '12' });
            userInfo = r4.userInfo;
            userStatus = r4.userStatus;
            const field = r4.field;

            return { field, userInfo, userStatus };
        },
        signout: async() => {
            await emit('front', { line: 'out', userInfo, userStatus });
    
            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus };
        },
    
        toDungeon: async(field, userInfo, userStatus) => {
            const r1 = await emit('front', { line: 'd', userInfo, userStatus });
    
            userInfo = r1.userInfo;
            field = 'dungeon';
            
            return { field, userInfo, userStatus };
        },    
        toVillage: async(field, userInfo, userStatus) => {
            const r1 = await emit('front', { line: 'v', userInfo, userStatus });
    
            userInfo = r1.userInfo;
            field = 'village';
    
            return { field, userInfo, userStatus };
        },
    
        toHome: async(field, userInfo, userStatus) => {
            const res = await emit('global', { line: 'home', userInfo, userStatus });
            userInfo = res.userInfo;
            field = 'front';
    
            return { field, userInfo, userStatus };
        },
        globalHelp: async(field, userInfo, userStatus) => {
            await emit('global', { line: 'help', userInfo, userStatus });
    
            return { field, userInfo, userStatus };
        },
        globalSignout: async() => {
            await emit('global', { line: 'out', userInfo, userStatus });
    
            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus };
        },
    
        delete: async() => {
            await emit('front', { line: 'delete', userInfo, userStatus });
    
            const field = 'none';
            const userInfo = {};
            const userStatus = {};
    
            return { field, userInfo, userStatus };
        }
    }
}