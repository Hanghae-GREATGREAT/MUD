import { Socket } from 'socket.io';
import env from '../config.env';
import { fetchPost } from '../common';
import { ChatInput } from '../interfaces/socket';


const FRONT_URL = `${env.HTTP}://${env.WAS_LB}/front`;

export default {
    chatController: (socket: Socket, { name, message, field }: ChatInput) => {
        const script = `${name}: ${message}\n`;

        const URL = `${FRONT_URL}/chat/submit`;
        fetchPost({ URL, socketId: socket.id, option: script });
    },
};
