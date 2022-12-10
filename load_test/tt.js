

const map = new Map();
const a = {
    '45': { dungeonLevel: 3, monsterId: 225370 },
    '76': {
        dungeonLevel: 3,
        monsterId: 225369,
        autoAttackTimer: {
            _idleTimeout: 1500,
            _idlePrev: ['TimersList'],
            _idleNext: ['Timeout'],
            _idleStart: 247654,
            _onTimeout: ['Function (anonymous)'],
            _timerArgs: undefined,
            _repeat: 1500,
            _destroyed: false,
            // [Symbol(refed)]: true,
            // [Symbol(kHasPrimitive)]: false,
            // [Symbol(asyncId)]: 129091,
            // [Symbol(triggerId)]: 0
        }
    }
}

map.set('45', a[45]);
map.set('76', a[76]);

const b = Object.fromEntries(map);
const c = Object.entries(b);

for (const d of c) {
    const e = d[1];
    if (Object.hasOwn(e, 'autoAttackTimer')) {
        const f = e.autoAttackTimer;
        console.log(f);
    }
}