import { socket } from "../socket.routes";
import { LineInput, CommandRouter } from "../interfaces/socket";
import front from "../front";


export const noneController = ({ line, user }: LineInput) => {
    const [ CMD1, CMD2 ]: string[] = line.trim().toUpperCase().split(' ');

    const commandRouter: CommandRouter = {
        'LOAD': front.loadHome
    }
    const result = commandRouter[CMD1](CMD2, user);
    socket.emit('print', result);
    socket.emit('enterChat', 'none');
}