import { Socket } from 'socket.io';
import redis from './db/redis/config';
import { battle, chat, field, home } from './controller';


export let socket: Socket;

const onConnection = (server: Socket) => {
    console.log('SOCKET CONNECTED');
    socket = server;

    /************************************************************************
                                    홈                                      
     ************************************************************************/

    socket.on('none', home.noneController);

    socket.on('front', home.frontController);

    socket.on('sign', home.signController);

    /************************************************************************
                                    필드                                      
     ************************************************************************/

    server.on('dungeon', field.dungeonController);

    server.on('village', field.villageController);

    /************************************************************************
                                    전투                                      
     ************************************************************************/

    socket.on('battle', battle.battleController);

    socket.on('encounter', battle.encounterController);

    socket.on('action', battle.actionController);

    socket.on('fight', battle.fightController);

    /************************************************************************
                                   모험 종료                                      
     ************************************************************************/

    socket.on('adventureResult', battle.resultController);

    /************************************************************************
                                    채팅박스                                      
     ************************************************************************/

    socket.on('submit', chat.chatController);

    server.on('disconnect', () => {
        redis.del(server.id);
        console.log(server.id, 'SOCKET DISCONNECTED');
    });
};

export default onConnection;
