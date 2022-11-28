import { Socket } from 'socket.io';
import { redis } from '../db/cache';
import { chatJoiner } from '../handler/front/home.handler';
import { ChatInput } from '../interfaces/socket';

export default {
    chatController: (socket: Socket, { name, message, field }: ChatInput) => {
        redis.set(socket.id, name, { EX: 60 * 5 });

        const script = `${name}: ${message}\n`;
        socket.to(chatJoiner[socket.id]).emit('chat', { script, field });
        socket.emit('chat', { script, field });
    },
};