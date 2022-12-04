const commandRouter = {
    'none': frontSend,
    'front': frontSend,
    'sign': frontSend,

    'dungeon': battleSend,
    'encounter': battleSend,
    'action': battleSend,
    'battle': battleSend,
    'autoBattle': battleSend,
    'adventureResult': battleSend,

    'village': gerneralSend,
    'story': gerneralSend,
    'heal': gerneralSend,
    'enhance': gerneralSend,
    'gamble': gerneralSend,

    'pvpNpc': pvpSend,
    'pvpList': pvpSend,
    'pvpBattle': pvpSend,
    'enemyChoice': pvpSend,
    'attackChoice': pvpSend,
    'enemyAttack': pvpSend,

    'global': globalSend,
}

function gerneralSend(field, input) {
    console.log('general send', field, input.line);

    mainSocket.volatile.emit(field, input);
}

function checkSkillCD(cooldown) {
    return Date.now() - cooldown < 1500;
}

function frontSend(field, input) {
    console.log('front send', field, input.line);
    frontSocket.volatile.emit(field, input);
}

function battleSend(field, input) {
    console.log('battle send', field, input.line);
    const { cooldown } = input.userStatus;

    if (checkSkillCD(+cooldown)) {
        const script = '아직 스킬이 준비되지 않았습니다.\n';
        commandLine.append(script);
        commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
        return;
    }
    battleSocket.volatile.emit(field, input);
}

function pvpSend(field, input) {
    console.log('pvp send', field, input.line);

    pvpSocket.volatile.emit(field, input);
}

function globalSend(field, input) {
    console.log('global send', field, input.line, input.option);

    if (input.option.match(/battle|action|autoBattle|pvp/)) {
        const script = `\n전투 중에는 불가능한 명령입니다!!\n`;
        commandLine.append(script);
        commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
        return;
    }

    mainSocket.volatile.emit(field, input);
}
