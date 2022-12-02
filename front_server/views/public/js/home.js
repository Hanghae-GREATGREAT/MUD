const SERVER_URL = SERVER.getServerUrl();
console.log(SERVER_URL);
const toServer = io.connect(`ws://${SERVER_URL}/`, { transports: ['websocket'] });
const toBattle = io.connect(`ws://${SERVER_URL}/battle`, { transports: ['websocket'] });
const toPvp = io.connect(`ws://${SERVER_URL}/pvp`, { transports: ['websocket'] });
console.log(toPvp)

const commandLine = $('.commendLine');
const commendInput = $('#commendInput');
const commendForm = $('.commendInput');
const chatInput = $('#chatInput');
const chatBoxId = $('#chatBox');
const chatForm = $('.chatForm');

let status;
$(async () => {
    chatBoxId.empty();
    commandLine.empty();

    status = new State();
    const { field, userInfo } = await checkSession();
    console.log('load script', field, userInfo);
    loadScript(field, userInfo);
});

function checkSession() {
    console.log('refreshed...checking session');
    let field = localStorage.getItem('field');
    let userInfo = localStorage.getItem('user');

    if (!field || !field.match(/dungeon|village/) || !userInfo || userInfo === '{}') {
        console.log('invalid session');
        status.set({});
        field = 'none';
        userInfo = '{}';

        return { field, userInfo };
    }

    console.log('valid session found');
    return new Promise((resolve) => {
        const { characterId } = JSON.parse(userInfo);
        toServer.emit('request user status', characterId, (response) => {
            const { userStatus } = response;
            status.set(userStatus);
            console.log('status loaded: ', userStatus);

            resolve({ field, userInfo });
        });
    });
}

function loadScript(field, userInfo) {
    switch (field) {
        case 'dungeon':
            toBattle.emit('dungeon', { line: 'LOAD', userInfo: JSON.parse(userInfo) });
            return;    
        case 'village':
            toServer.emit('dungeon', { line: 'LOAD', userInfo: JSON.parse(userInfo) });
            return;
        default:
            toServer.emit('none', { line: 'LOAD', userInfo: {} });
            return;
    }
}

function checkValidation(userInfo) {
    toServer.emit('none', { line: 'CHECK', userInfo });
}

/*****************************************************************************
                                커맨드 스크립트
******************************************************************************/

commendForm.submit((e) => {
    e.preventDefault();
    let [field, option] = localStorage.getItem('field').split(':');
    const line = commendInput.val();
    commendInput.val('');
    const userInfo = localStorage.getItem('user');
    const userStatus = status.get();

    if (line.slice(0, 2).trim().toUpperCase() === 'G') [field, option] = ['global', field];
    const input = { line, userInfo: JSON.parse(userInfo), userStatus, option };

    if (!Object.hasOwn(commandRouter, field)) gerneralSend(field, input);
    commandRouter[field](field, input);
});

function checkSkillCD(cooldown) {
    return Date.now() - cooldown < 1500;
}

toServer.on('print', printHandler);
toBattle.on('print', printHandler);
toPvp.on('print', printHandler);

function printHandler({ field, script, userInfo }) {
    console.log(field);
    localStorage.setItem('field', field);
    if (userInfo) localStorage.setItem('user', JSON.stringify(userInfo));

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

toServer.on('printBattle', printBattleHandler);
toBattle.on('printBattle', printBattleHandler);
toPvp.on('printBattle', printBattleHandler);

function printBattleHandler({ field, script, userInfo, userStatus }) {
    console.log('printBattle', field);
    localStorage.setItem('field', field);
    if (userInfo) localStorage.setItem('user', JSON.stringify(userInfo));
    if (userStatus) {
        console.log('printBattle received status ', userStatus);
        status.set(userStatus);
    }

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

toServer.on('fieldScriptPrint', fieldScriptPrint);
toPvp.on('fieldScriptPrint', fieldScriptPrint);

function fieldScriptPrint({ field, script }) {
    localStorage.setItem('field', field);

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

toServer.on('signout', signoutHandler);

async function signoutHandler({ field, script, userInfo }) {
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('field', field);
    status.set({});

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);

    loadScript(field, JSON.stringify(userInfo));
}

/*****************************************************************************
                                채팅 스크립트
******************************************************************************/

const chatEnterRoom = (userName, people, limit) => {
    // chatBoxId.empty();
    const newMessage = `<span>${userName}님이 채팅방에 입장하였습니다.\n(${people}/${limit}명 참가중)</span>\n`;
    chatBoxId.append(newMessage);
};
const reEnterRoom = () => {
    chatBoxId.empty();
    const newMessage = `<span>채팅방에 다시 연결 되었습니다.\n`;
    chatBoxId.append(newMessage);
};

const chatNewMessage = ({ script, field }) => {
    console.log('NEEEEEEEEEEEW', field, script);
    const newMessage = `<span>${script}</span>`;
    const currentField = localStorage.getItem('field');
    if (currentField.includes(field)) {
        chatBoxId.append(newMessage);
        chatBoxId.scrollTop(Number.MAX_SAFE_INTEGER);
    }
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
        field,
    };
    toServer.emit('submit', data);
    chatInput.val('');
});

toServer.on('chat', chatNewMessage);

toServer.on('enterChat', chatEnterRoom);

toServer.on('reEnterChat', reEnterRoom);
