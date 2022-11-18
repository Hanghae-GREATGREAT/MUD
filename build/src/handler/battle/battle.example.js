"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skill1 = exports.battleLoop = exports.example1Handler = void 0;
const battleLoops = {};
function example1Handler(CMD, user) {
    console.log('battle examplehandler');
    const script = '';
    const field = '';
    return { script, user, field };
}
exports.example1Handler = example1Handler;
function battleLoop(CMD, user) {
    console.log('battleLoop');
    let cnt = 0;
    const name = setInterval(() => {
        console.log(cnt++);
    }, 500);
    // eval(`const loop_${user.username} = ${name}`)
    battleLoops[user.username] = name;
    console.log('setInternal name: ', name);
    const script = 'start battle';
    const field = 'battle';
    return { script, user, field };
}
exports.battleLoop = battleLoop;
function skill1(CMD, user) {
    console.log('skill1');
    console.log('clear name from loops: ', battleLoops[user.username]);
    if (CMD === 'dead')
        clearInterval(battleLoops[user.username]);
    const script = 'aaaaaaaaaaaaaaaaa';
    const field = 'battle';
    return { script, user, field };
}
exports.skill1 = skill1;
