import { socket } from '../socket.routes';
import { redis } from '../db/cache';
import { ChatInput } from '../interfaces/socket';


export default {
    chatController: ({ name, message, field }: ChatInput) => {
        redis.set(socket.id, name, { EX: 60 * 5 });

        const script = `${name}: ${message}\n`;
        socket.broadcast.emit('chat', { script, field });
        socket.to(socket.id).emit('chat', { script, field });
    }
}



// socket.on('info', ({ name }: UserSession)=>{
//     CharacterService.findOneByName(name).then((character)=>{
//         if (character === null) throw new Error();

//         const script = `${character.Field.name} 채팅방에 입장하였습니다.\n`
//         socket.to(socket.id).emit('print', { script });
//     });
//     redis.set(socket.id, name, { EX: 60*5 });
// });