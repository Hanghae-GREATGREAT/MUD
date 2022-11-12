import { UserSession } from '../../interfaces/user';

interface BattleLoop {
    [key: string]: NodeJS.Timer;
}
const battleLoops: BattleLoop = {};

export function example1Handler(CMD: string | undefined, user: UserSession) {
    console.log('battle examplehandler');

    const script = '';
    const field = '';
    return { script, user, field };
}

export function battleLoop(CMD: string | undefined, user: UserSession) {
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

export function skill1(CMD: string | undefined, user: UserSession) {
    console.log('skill1');

    console.log('clear name from loops: ', battleLoops[user.username]);

    if (CMD === 'dead') clearInterval(battleLoops[user.username]);
    const script = 'aaaaaaaaaaaaaaaaa';
    const field = 'battle';
    return { script, user, field };
}
