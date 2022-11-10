/*****************************************************************************
                              페이지 초기 스크립트
******************************************************************************/
const userInfo = $('#userInfo');

const socket = io('/');

$(() => {
    chatBoxId.empty();
    userInfo.empty();
    commandLine.empty();

    const userStore = localStorage.getItem('user');
    const user = JSON.parse(userStore);

    dungeon();
    statusLoader(user);

    socket.emit('info', { name: user.name });
});

/*****************************************************************************
                                커맨드 스크립트
******************************************************************************/

const statusLoader = ({ username, name, level, maxhp, maxmp, hp, mp, exp }) => {
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

// const main = `<span></span>
// `
// commandLine.append(main)

const commandLine = $('.commendLine');
const commendInput = $('#commendInput');

async function dungeon() {
    try {
        commandLine.empty();
        const { data } = await axios.get(
            'http://localhost:8080/battle/dungeon'
        );

        const script = data.script;
        const options = data.options;
        const items = `<span>${script}\n\n${options}</span>`;
        commandLine.append(items);

        localStorage.setItem('battle', 'dungeon');
    } catch (error) {
        console.log(error);
    }
}

const commendForm = document.querySelector('.commendInput');
commendForm.addEventListener('submit', commandHandler);

function commandHandler(e) {
    const commandEventFn = {
        dungeon: enter,
        enter: proceed,
        proceed: fight,
    };

    const battle = localStorage.getItem('battle');
    commandEventFn[battle](e);
}

async function enter(e) {
    try {
        console.log(111111);
        e.preventDefault();
        commandLine.empty();

        const input = commendInput.val();
        if (input > 5) {
            await dungeon();
            commandLine.append(`\n\n없는 던전입니다.`);
            commendInput.val('');
            return;
        }

        if (!input) {
            await dungeon();
            commandLine.append(`\n\n던전을 선택해주세요.`);
            return;
        }

        const { data } = await axios.post(
            'http://localhost:8080/battle/dungeon/enter',
            { input }
        );
        console.log(data);

        const { script, opsions } = data;
        const commend = `<span>${script}\n${opsions}</span>`;
        commandLine.append(commend);
        commendInput.val('');
        localStorage.setItem('battle', 'enter');
    } catch (error) {
        console.log(error);
    }
}

async function proceed(e) {
    try {
        console.log('enter');
        e.preventDefault();
        commandLine.empty();

        const input = commendInput.val();
        if (input == 3) {
            await dungeon();
            commendInput.val('');
            return;
        } else if (input > 3) {
            commandLine.append(
                `<span>진행하기를 선택해주세요.\n\n돌아가려면 3번을 선택하세요.</span>`
            );
            commendInput.val('');
            return;
        }

        const { data } = await axios.get(
            'http://localhost:8080/battle/dungeon/proceed'
        );
        console.log(data);

        const { opsions, script } = data;
        const fight = `<span>${script}\n\n${opsions}</span>`;
        commandLine.append(fight);
        commendInput.val('');
        localStorage.setItem('battle', 'proceed');
    } catch (error) {
        console.log(error);
    }
}

async function fight(e) {
    try {
        console.log('proceed');
        e.preventDefault();
        commandLine.empty();

        const input = commendInput.val();
        if (input == 4) {
            await dungeon();
            commendInput.val('');
            return;
        } else if (input > 4) {
            commandLine.append(
                `<span>진행하기를 선택해주세요.\n\n돌아가려면 4번을 선택하세요.</span>`
            );
            commendInput.val('');
            return;
        }

        const { data } = await axios.post(
            'http://localhost:8080/battle/dungeon/fight',
            { input }
        );
        console.log(data);

        const { monsterScript, userScript } = data;
        const fight = `<span>${monsterScript}\n${userScript}</span>`;
        commandLine.append(fight);
        commendInput.val('');
        localStorage.setItem('battle', 'fight');
    } catch (error) {
        console.log(error);
    }
}

/*****************************************************************************
                                채팅 스크립트
******************************************************************************/
const chatSubmitId = $('#chatSubmit');
const chatBoxId = $('#chatBox');

const chatNewMessage = ({ script }) => {
    console.log('NEEEEEEEEEEEW', script);
    const newMessage = `<span>${script}</span>`;
    chatBoxId.append(newMessage);
};

const chatSubmitdHandler = () => {
    const user = localStorage.getItem('user');
    const { name } = JSON.parse(user);
    console.log(user);
    const data = {
        name,
        message: chatSubmitId.val(),
    };
    socket.emit('submit', data);
    chatSubmitId.val('');
};

socket.on('print', chatNewMessage);
