const SERVER_URL = SERVER.getServerUrl();
const mainSocket = io.connect(`ws://${SERVER_URL}/`);
const frontSocket = io.connect(`ws://${SERVER_URL}/front`);
const battleSocket = io.connect(`ws://${SERVER_URL}/battle`);
const pvpSocket = io.connect(`ws://${SERVER_URL}/pvp`);
// const mainSocket = io.connect(`ws://${SERVER_URL}/`, { transports: ['websocket'] });
// const frontSocket = io.connect(`ws://${SERVER_URL}/front`, { transports: ['websocket'] });
// const battleSocket = io.connect(`ws://${SERVER_URL}/battle`, { transports: ['websocket'] });
// const pvpSocket = io.connect(`ws://${SERVER_URL}/pvp`, { transports: ['websocket'] });

const commandLine = $('.commendLine');
const commendInput = $('#commendInput');
const commendForm = $('.commendInput');
const chatInput = $('#chatInput');
const chatBoxId = $('#chatBox');
const chatForm = $('.chatForm');
const chatJoinUserNum = $('#joinUserNum');

let status;
$(() => {
    chatBoxId.empty();
    commandLine.empty();

    status = new State();
    const { field, userInfo } = checkSession();
    console.log('load script', field, userInfo);
    loadScript(field, userInfo);
});

function CryptoController() {
    let secretKey = '';

    return {
        GenerateKey: () => {
            fetch(`http://${SERVER_URL}/api/key`).then((response) => {
                response.json().then(({ key }) => {
                    secretKey = key;
                });
            });
        },

        encryptClData: (field, userData) => {
            const encryptedField = CryptoJS.AES.encrypt(field, secretKey).toString();
            const encryptedUserData = CryptoJS.AES.encrypt(JSON.stringify(userData), secretKey).toString();
            return [encryptedField, encryptedUserData];
        },

        decryptClData: (field, userData) => {
            const decryptedField = CryptoJS.AES.decrypt(field, secretKey).toString(CryptoJS.enc.Utf8);
            const decryptedUserData = JSON.parse(
                CryptoJS.AES.decrypt(userData, secretKey).toString(CryptoJS.enc.Utf8),
            );
            return [decryptedField, decryptedUserData];
        },
    };
}

const crypto = CryptoController();
crypto.GenerateKey();

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
        mainSocket.emit('request user status', characterId, (response) => {
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
            battleSocket.emit('dungeon', { line: 'LOAD', userInfo: JSON.parse(userInfo) });
            return;
        case 'village':
            mainSocket.emit('dungeon', { line: 'LOAD', userInfo: JSON.parse(userInfo) });
            return;
        default:
            frontSocket.emit('none', { line: 'LOAD', userInfo: {} });
            return;
    }
}

function checkValidation(userInfo) {
    mainSocket.emit('none', { line: 'CHECK', userInfo });
}

/*****************************************************************************
                                커맨드 입력
******************************************************************************/

commendForm.submit((e) => {
    e.preventDefault();
    const decryptData = crypto.decryptClData(localStorage.getItem('field'), localStorage.getItem('user'));

    let [field, option] = decryptData[0].split(':');

    console.log('field : ', field);

    const line = commendInput.val();
    console.log('90: ', line);
    commendInput.val('');
    const userInfo = decryptData[1];
    const userStatus = status.get();

    if (
        line
            .slice(0, 2)
            .trim()
            .match(/g|G|ㅎ/)
    )
        [field, option] = ['global', field];
    const input = { line, userInfo, userStatus, option };

    if (!Object.hasOwn(commandRouter, field)) gerneralSend(field, input);
    commandRouter[field](field, input);
});

/*****************************************************************************
                                이벤트 리스너
******************************************************************************/

mainSocket.on('print', printHandler);
mainSocket.on('printBattle', printBattleHandler);
mainSocket.on('signout', signoutHandler);
mainSocket.on('fieldScriptPrint', fieldScriptPrint);

frontSocket.on('print', printHandler);
frontSocket.on('printBattle', printBattleHandler);
frontSocket.on('pwCoveringOn', pwCoveringOn);
frontSocket.on('pwCoveringOff', pwCoveringOff);

battleSocket.on('print', printHandler);
battleSocket.on('printBattle', printBattleHandler);

pvpSocket.on('print', printHandler);
pvpSocket.on('printBattle', printBattleHandler);
pvpSocket.on('fieldScriptPrint', fieldScriptPrint);

function printHandler({ field, script, userInfo }) {
    const encryptData = crypto.encryptClData(field, userInfo);

    localStorage.setItem('field', encryptData[0]);
    if (userInfo) localStorage.setItem('user', encryptData[1]);

    if (script) commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

function printBattleHandler({ field, script, userInfo, userStatus }) {
    const encryptData = crypto.encryptClData(field, userInfo);
    localStorage.setItem('field', encryptData[0]);

    if (userInfo) localStorage.setItem('user', encryptData[1]);
    if (userStatus) {
        console.log('printBattle received status ', userStatus);
        status.set(userStatus);
    }

    if (script) commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

function fieldScriptPrint({ field, script }) {
    const encryptData = crypto.encryptClData(field, { dummy: 1 });

    console.log('fieldScriptPrint', field, script);
    localStorage.setItem('field', encryptData[0]);

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);
}

function signoutHandler({ field, script, userInfo }) {
    const encryptData = crypto.encryptClData(field, userInfo);

    localStorage.setItem('field', encryptData[0]);
    if (userInfo) localStorage.setItem('user', encryptData[1]);
    status.set({});

    commandLine.append(script);
    commandLine.scrollTop(Number.MAX_SAFE_INTEGER);

    loadScript(field, JSON.stringify(userInfo));
}

function pwCoveringOn() {
    commendInput.attr('type', 'password');
}
function pwCoveringOff() {
    commendInput.attr('type', 'text');
}

/*****************************************************************************
                                채팅 스크립트
******************************************************************************/

chatForm.submit((e) => {
    e.preventDefault();

    const userInfo = localStorage.getItem('user');
    const { name } = JSON.parse(userInfo);
    const data = {
        name,
        message: chatInput.val(),
    };
    frontSocket.emit('submit', data);
    chatInput.val('');
});

const chatEnterRoom = (username, joinerCntScript) => {
    const newMessage = `<span>${username}님이 입장하셨습니다.\n</span>`;
    // 입장인원 갱신
    chatJoinUserNum.empty();
    chatJoinUserNum.append(`<span>Chat: ${joinerCntScript}</span>`);
    chatBoxId.append(newMessage);
};

const chatLeaveRoom = (joinerCntScript) => {
    // 입장인원 갱신
    chatJoinUserNum.empty();
    chatJoinUserNum.append(`<span>Chat: ${joinerCntScript}</span>`);
};

const reEnterRoom = () => {
    chatBoxId.empty();
    const newMessage = `<span>새로고침 확인.\n채팅에 다시 참여하기 위해 다시 로그인 해주세요.\n</span>`;
    chatBoxId.append(newMessage);
};

const chatNewMessage = (script) => {
    const newMessage = `<span>${script}</span>`;

    chatBoxId.append(newMessage);
    chatBoxId.scrollTop(Number.MAX_SAFE_INTEGER);
};

frontSocket.on('chat', chatNewMessage);

frontSocket.on('joinChat', chatEnterRoom);

frontSocket.on('leaveChat', chatLeaveRoom);

frontSocket.on('reEnterChat', reEnterRoom);
