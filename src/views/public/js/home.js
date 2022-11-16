const server = io('/');



const commandLine = $('.commendLine');
const commendInput = $('#commendInput');
const commendForm = $('.commendInput');
const userInfo = $('#userInfo');
const chatInput = $('#chatInput');
const chatBoxId = $('#chatBox');
const chatForm = $('.chatForm')

$(async() => {
    chatBoxId.empty();
    userInfo.empty();
    commandLine.empty();

    const { field, user } = await checkStorage();
    loadScript(field, user);
    statusLoader(JSON.parse(user));
});

function checkStorage() {
    let field = localStorage.getItem('field');
    let user = localStorage.getItem('user');

    // if (field !== 'dungeon' || field !== 'village' || !user || user==='{}') {
    if (field!== 'none' || !user || user==='{}') {
        field = 'none';
        user = '{}';
    }

    return new Promise((resolve, reject) => resolve({ field, user }));
}

function checkValidation(user) {
    server.emit('none', { line: 'CHECK', user });
}


/*****************************************************************************
                                커맨드 스크립트
******************************************************************************/

function loadScript(field, user) {
    if (field === 'none' || user === '{}') {
        return server.emit('none', { line: 'LOAD', user: {} });
    }
    server.emit('dungeon', { line: 'LOAD', user: JSON.parse(user) });
}

commendForm.submit((e) => {
    e.preventDefault();
    const line = commendInput.val();
    commendInput.val('');

    /**
     * field = front | home | village | dungeon | battle | ...
     */
    const [field, option] = localStorage.getItem('field').split(':');
    const user = localStorage.getItem('user');
    // field = line ? 'field' : 'global'    글로벌 명령어 판별

    switch (field) {
        case 'action':
            const cooldown = localStorage.getItem('cooldown');
            if (checkSkillCD(+cooldown)) {
                const script = '아직 스킬이 준비되지 않았습니다.\n'
                commandLine.append(script);
                commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
                return;
            }
            server.emit(field, { line, user: JSON.parse(user), option });
            break;
        case 'global':
            break;
        default:
            server.emit(field, { line, user: JSON.parse(user), option });
    }
});

function checkSkillCD(cooldown) {
    return ((Date.now() - cooldown) < 1500);
}

server.on('print', printHandler);

function printHandler({ script, user, field }) {
    console.log(script, user, field);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('field', field);

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
    statusLoader(user);
}

server.on('printBattle', printBattleHandler);

function printBattleHandler({ script, user, field, cooldown }) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('field', field);
    if (cooldown) localStorage.setItem('cooldown', cooldown);

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
    statusLoader(user);
}

server.on('signout', signoutHandler);

async function signoutHandler({ script }) {
    localStorage.clear();

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);

    const { field, user } = await checkStorage();
    loadScript(field, user);
}

const statusLoader = ({ username, name, level, maxhp, maxmp, hp, mp, exp }) => {
    userInfo.empty();

    if (localStorage.getItem('field') === 'none' || username === undefined || name === undefined) {
            const status = `
        <div class="infoName">
            <span>로그인을 해주세요</span>
        </div>
        `;
        return userInfo.append(status);;
    }
    const status = `
    <div class="infoName">
        <span>${name} / Lv. ${level}</span><span class="exp">경험치: ${exp}</span>
    </div>
    <div class="infoSub">
        <div class="infoUser"><span>${username}</span></div>
        <div class="infoStatus">
            <span>체력: ${maxhp}/${hp}</span>
            <span>마나: ${maxmp}/${mp}</span>    
        </div>
    </div>
    `;
    userInfo.append(status);
};




/*****************************************************************************
                                채팅 스크립트
******************************************************************************/

const chatEnterRoom = (field) => {
    const chatRoom = {
        'none': 'none',
        'home': '홈',
        'village': '마을',
        'dungeon': '던전',      // 던전 세분화해야함
    }
    chatBoxId.empty();
    if (chatRoom[field] === 'none') return chatBoxId.append('채팅은 마을과 던전에서만 가능합니다.\n');
    const newMessage = `<span>${chatRoom[field]} 채팅방에 입장하였습니다.</span>\n`;
    chatBoxId.append(newMessage);
};

const chatNewMessage = ({ script, field }) => {
    console.log('NEEEEEEEEEEEW', field, script);
    const newMessage = `<span>${script}</span>`;
    const currentField = localStorage.getItem('field');
    if (currentField.includes(field)) {
        chatBoxId.append(newMessage);
        chatBoxId.scrollTop(Number.MAX_SAFE_INTEGER);
    };
};

chatForm.submit((e) => {
    e.preventDefault();
    const field = localStorage.getItem('field').split(':')[0];
    if (!field.match(/dungeon|village/)) return chatInput.val('');
    
    const user = localStorage.getItem('user');
    const { name } = JSON.parse(user);
    const data = {
        name,
        message: chatInput.val(),
        field
    };
    server.emit('submit', data);
    chatInput.val('');
});

server.on('chat', chatNewMessage);

server.on('enterChat', chatEnterRoom);