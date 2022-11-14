import { Socket } from 'socket.io';
import { redis } from './db/cache';
import { battle, chat, field, home } from './controller';


export let socket: Socket;

const onConnection = (server: Socket) => {
    console.log('SOCKET CONNECTED');
    socket = server;

    /************************************************************************
                                    홈                                      
     ************************************************************************/

    server.on('none', home.noneController);

    server.on('front', home.frontController);

    server.on('sign', home.signController);

    /************************************************************************
                                    필드                                      
     ************************************************************************/

    server.on('dungeon', field.dungeonController);

    server.on('village', field.villageController);

    /************************************************************************
                                    전투                                      
     ************************************************************************/

    server.on('battle', battle.battleController);

    server.on('encounter', battle.encounterController);

    server.on('action', battle.actionController);

    server.on('autoBattle', battle.autoBattleController);

    /************************************************************************
                                   모험 종료                                      
     ************************************************************************/

    server.on('adventureResult', battle.resultController);

    /************************************************************************
                                    채팅박스                                      
     ************************************************************************/

    server.on('submit', chat.chatController);

    server.on('disconnect', () => {
        redis.del(server.id);
        console.log(server.id, 'SOCKET DISCONNECTED');
    });
};

export default onConnection;
