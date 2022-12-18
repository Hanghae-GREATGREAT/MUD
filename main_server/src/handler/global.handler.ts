import { Socket } from "socket.io";
import { UserInfo } from "../interfaces/user";
import { globalScript } from "../scripts";



export default {
    backToHome: (socket: Socket, CMD: string|undefined, userInfo: UserInfo) => {
        const script = globalScript.title;
        const field = 'front';

        socket.emit('print', { field, script, userInfo });
    },

    help: (socket: Socket, CMD: string|undefined, userInfo: UserInfo, option: string) => {
        //console.log('help handler', CMD, userInfo, option);
        const script = globalScript.help;
        const field = option;

        socket.emit('print', { field, script, userInfo });
    }
};