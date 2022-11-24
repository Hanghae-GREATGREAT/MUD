const commandRouter = {
    'none': gerneralSend,
    'front': gerneralSend,
    'sign': gerneralSend,

    'dungeon': battleSend,
    'action': battleSend,
    'battle': battleSend,
    'autoBattle': battleSend,
    'adventureResult': battleSend,

    'village': gerneralSend,
    'story': gerneralSend,
    'heal': gerneralSend,
    'enhance': gerneralSend,
    'gamble': gerneralSend,

    'global': gerneralSend,
}

function gerneralSend(field, option) {
    console.log('general send', field, option)
    const line = commendInput.val();
    commendInput.val('');
    const userInfo = localStorage.getItem('user');
    const userStatus = status.get();

    toServer.volatile.emit(field, { line, userInfo: JSON.parse(userInfo), userStatus, option });
}

function battleSend(field, option) {
    console.log('battle send', field, option)
    const line = commendInput.val();
    commendInput.val('');
    const userInfo = localStorage.getItem('user');
    const userStatus = status.get();
    const { cooldown } = userStatus;

    if (checkSkillCD(+cooldown)) {
        const script = '아직 스킬이 준비되지 않았습니다.\n'
        commandLine.append(script);
        commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
        return;
    }
    toServer.volatile.emit(field, { line, userInfo: JSON.parse(userInfo), userStatus, option });
}