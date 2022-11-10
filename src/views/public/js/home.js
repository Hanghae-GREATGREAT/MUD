const socket = io('/');

const commandLine = $('.commendLine');
const commendInput = $('#commendInput');
const userInfo = $('#userInfo');
const chatSubmitId = $('#chatSubmit');
const chatBoxId = $('#chatBox');

$(async() => {
    chatBoxId.empty();
    userInfo.empty();
    commandLine.empty();

    const { field, user } = await checkStorage();
    loadScript(field, user);
});

function checkStorage() {
    let field = localStorage.getItem('field');
    let user = localStorage.getItem('user');

    if (!field || !user || user==='{}') {
        field = 'none';
        user = '{}';
    }

    return new Promise((resolve, reject) => resolve({ field, user }));
}

function loadScript(field, user) {
    socket.emit(field, { line: 'load', user: JSON.parse(user) });
}

const commendForm = document.querySelector('.commendInput');
commendForm.addEventListener('submit', commandHandler);

function commandHandler(e) {
    e.preventDefault();
    const line = commendInput.val();

    /**
     * field = front | home | village | dungeon | battle | ...
     */
    const [field, option] = localStorage.getItem('field').split(':');
    const user = localStorage.getItem('user');

    socket.emit(field, { line, user: JSON.parse(user), option });
}


socket.on('print', printHandler);

function printHandler({ script, user, field }) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('field', field);

    commandLine.append(script);
}

socket.on('signout', signoutHandler);

function signoutHandler({ script }) {
    localStorage.clear();

    commandLine.append(script);
    loadScript();
}