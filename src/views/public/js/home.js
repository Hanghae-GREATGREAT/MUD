

const socket = io('/');

const commandLine = $('.commendLine');
const commendInput = $('#commendInput');

const commendForm = document.querySelector('.commendInput');
commendForm.addEventListener('submit', commandHandler);

function commandHandler(e) {
    e.preventDefault();
    const line = commendInput.val();

    /**
     * field = home | village | dungeon | battle | ...
     */
    const field = localStorage.getItem('field');
    const user = localStorage.getItem('user')

    socket.emit(field, { line, user: JSON.parse(user) });
}


socket.on('print', printHandler);


function printHandler({ script, user, field }) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('field', field);

    commandLine.append(script);
}