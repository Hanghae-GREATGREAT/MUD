
const { io } = require('socket.io-client');
const URL = 'ws://localhost:3333';
const mainSocket = io(URL, { transports: ['websocket'] });
const BURL = 'ws://localhost:3333/battle';
const battleSocket = io(BURL, { transports: ['websocket'] });

const END = () => {
    mainSocket.disconnect();
    battleSocket.disconnect();
    process.exit(0);
}
const WAIT_COMMAND = Math.random()*3 + 0.5;

const main = require('./units/main')(mainSocket, WAIT_COMMAND);
const battle = require('./units/battle')(battleSocket, WAIT_COMMAND);
const village = require('./units/village')(mainSocket, WAIT_COMMAND);


main.signin('qwe123').then(async({ field, userInfo, userStatus }) => {
    console.log('SIGNED', field, userInfo, userStatus);

    const res1 = await main.toDungeon(field, userInfo, userStatus);
    console.log('to dungeon', res1);

    const res2 = await battle.autoFromList(field, userInfo, userStatus, 10);
    console.log('battle over', res2);
    userStatus = res2.userStatus;
    field = res2.field;

    if (field === 'heal') {
        const res3 = await village.heal(field, userInfo, userStatus);
        userStatus = res3.userStatus;
        console.log('healed', res3);
        const res4 = await main.toHome(field, userInfo, userStatus)
        console.log('test success(player dead)', res4);

        return END();
    }
    const res3 = await main.toHome(field, userInfo, userStatus)
    console.log('test success', res3);

    END();
}).catch((error) => {
    console.error(error);
    console.log('test fail');

    END();
});


/**
{ userId: 1002, username: 'qwe123', characterId: 1001, name: 'qwe123' } 

{
    characterId: 1001,
    username: 'qwe123',
    name: 'qwe123',
    job: 'novice',
    level: 6,
    attack: 16,
    defense: 16,
    maxhp: 600,
    maxmp: 600,
    hp: 600,
    mp: 600,
    exp: 685,
    item: '4:1',
    skill: [ { skillId: 1, name: '강타', type: 10, cost: 100, multiple: 180 } ]
}
*/