"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_routes_1 = require("../socket.routes");
const cache_1 = require("../db/cache");
exports.default = {
    chatController: ({ name, message, field }) => {
        cache_1.redis.set(socket_routes_1.socket.id, name, { EX: 60 * 5 });
        const script = `${name}: ${message}\n`;
        socket_routes_1.socket.broadcast.emit('chat', { script, field });
        socket_routes_1.socket.emit('chat', { script, field });
    }
};
// socket.on('info', ({ name }: UserSession)=>{
//     CharacterService.findOneByName(name).then((character)=>{
//         if (character === null) throw new Error();
//         const script = `${character.Field.name} 채팅방에 입장하였습니다.\n`
//         socket.emit('print', { script });
//     });
//     redis.set(socket.id, name, { EX: 60*5 });
// });
