

const server = io.connect('/', { transports: ['websocket'] });
const BE_URL = 'http://127.0.0.1:8080'


const commandLine = $('.commendLine');
const commendInput = $('#commendInput');
const commendForm = $('.commendInput');
const chatInput = $('#chatInput');
const chatBoxId = $('#chatBox');
const chatForm = $('.chatForm')


const status = new State();

$(async() => {
    chatBoxId.empty();
    commandLine.empty();

    const { field, userInfo } = await checkSession();
    console.log(field, userInfo);
    loadScript(field, userInfo);
});

async function checkSession() {
    console.log('refreshed...checking session')
    let field = localStorage.getItem('field');
    let userInfo = localStorage.getItem('user');

    if (!field || !field.match(/dungeon|village/) || !userInfo || userInfo==='{}') {
        console.log('invalid session');
        status.set({});
        field = 'none';
        userInfo = '{}';

        return { field, userInfo };
    }
    console.log('valid session found');
    const { characterId } = JSON.parse(userInfo);
    const res = await fetch(`/api/userStatus/${characterId}`);
    const { userStatus } = await res.json();
    status.set(userStatus);

    console.log('status loaded: ', userStatus);

    return { field, userInfo };
}

function loadScript(field, userInfo) {
    if (field === 'none' || userInfo === '{}') {
        return server.emit('none', { line: 'LOAD', userInfo: {} });
    }
    server.emit('dungeon', { line: 'LOAD', userInfo: JSON.parse(userInfo) });
}

function checkValidation(userInfo) {
    server.emit('none', { line: 'CHECK', userInfo });
}


/*****************************************************************************
                                커맨드 스크립트
******************************************************************************/

commendForm.submit((e) => {
    e.preventDefault();
    const [field, option] = localStorage.getItem('field').split(':');
    // field = line ? 'field' : 'global'    글로벌 명령어 판별

    if (!Object.hasOwn(commandRouter, field)) gerneralSend(field, option);
    commandRouter[field](field, option);
});

function checkSkillCD(cooldown) {
    return ((Date.now() - cooldown) < 1500);
}

server.on('print', printHandler);

function printHandler({ field, script, userInfo }) {
    localStorage.setItem('field', field);
    if (userInfo) localStorage.setItem('user', JSON.stringify(userInfo));

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

server.on('printBattle', printBattleHandler);

function printBattleHandler({ field, script, userInfo, userStatus }) {
    console.log('printBattle', field, userInfo)
    localStorage.setItem('field', field);
    if (userInfo) localStorage.setItem('user', JSON.stringify(userInfo));    
    if (userStatus) {
        console.log('printBattle received status ', userStatus);
        status.set(userStatus);
    }

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

server.on('signout', signoutHandler);

async function signoutHandler({ field, script, userInfo }) {
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('field', field);

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);

    loadScript(field, userInfo);
}



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
    
    const userInfo = localStorage.getItem('user');
    const { name } = JSON.parse(userInfo);
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
