import env from '../config.env';
import { Socket } from 'socket.io';
import { redis } from '../db/cache';
import { chatJoiner } from '../handler/front/home.handler';
import { ChatInput } from '../interfaces/socket';
import { fetchPost } from '../common';

const FRONTCHAT_URL = `http://${env.FRONTCHAT_URL}:${env.FRONTCHAT_PORT}`;

export default {
    chatController: (socket: Socket, { name, message, field }: ChatInput) => {
        const script = `${name}: ${message}\n`;

        const URL = `${FRONTCHAT_URL}/chat/submit`;
        fetchPost({ URL, socketId: socket.id, option: script });
    },
};
