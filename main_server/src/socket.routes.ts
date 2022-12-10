import { Socket } from 'socket.io';
import { battle, chat, common, field, home, TEST, village, pvpBattle } from './controller';
import { ChatInput, SocketInput } from './interfaces/socket';

export const socketIds: Map<number, string> = new Map<number, string>(); 

export let emitCount = 0;

export const battleConnection = (socket: Socket) => {
    console.log('BATTLE NAMESPACE CONNECTED', socket.id);
    emitCount = (emitCount + 1) % 100_000_000;

    socket.on('dungeon', (input: SocketInput) => field.dungeonController(socket, input));

    socket.on('battle', (input: SocketInput) => battle.battleController(socket, input));

    socket.on('encounter', (input: SocketInput) => battle.encounterController(socket, input));

    socket.on('action', (input: SocketInput) => battle.actionController(socket, input));

    socket.on('autoBattle', (input: SocketInput) => battle.autoBattleController(socket, input));
    socket.on('autoBattleS', (input: SocketInput) => battle.autoBattleSController(socket, input));

    socket.on('adventureResult', (input: SocketInput) => battle.resultController(socket, input));
};

export const frontConnection = (socket: Socket) => {
    console.log('FRONT NAMESPACE CONNECTED', socket.id);
    emitCount = (emitCount + 1) % 100_000_000;

    socket.on('none', (input: SocketInput) => home.noneController(socket, input));

    socket.on('front', (input: SocketInput) => home.frontController(socket, input));

    socket.on('sign', (input: SocketInput) => home.signController(socket, input));

    socket.on('submit', (input: ChatInput) => chat.chatController(socket, input));

    socket.on('global', (input: SocketInput) => common.globalController(socket, input));

    socket.on('disconnect', () => common.chatLeave(socket));
};

export const pvpConnection = (socket: Socket) => {
    console.log('PVP NAMESPECE CONNECTED', socket.id);
    emitCount = (emitCount + 1) % 100_000_000;

    /************************************************************************
                                   시련의 장                                      
     ************************************************************************/
    socket.on('pvpNpc', (input: SocketInput) => village.pvpController(socket, input));

    socket.on('pvpList', (input: SocketInput) => pvpBattle.pvpListController(socket, input))

    socket.on('pvpJoin', (input: SocketInput) => pvpBattle.pvpJoinController(socket, input));

    socket.on('pvpBattle', (input: SocketInput) => pvpBattle.pvpBattleController(socket, input));

    // socket.on('pvpResult', (input: SocketInput) => pvpBattle.pvpResultController(socket, input));

    socket.on('disconnect', () => common.pvpRoomLeave(socket));
}

export const onConnection = (socket: Socket) => {
    console.log('MAIN NAMESPACE CONNECTED', socket.id);
    emitCount = (emitCount + 1) % 100_000_000;

    /************************************************************************
                                    마을                                      
     ************************************************************************/

    socket.on('village', (input: SocketInput) => field.villageController(socket, input));

    socket.on('story', (input: SocketInput) => village.storyController(socket, input));

    socket.on('heal', (input: SocketInput) => village.healController(socket, input));

    socket.on('enhance', (input: SocketInput) => village.enhanceController(socket, input));

    socket.on('gamble', (input: SocketInput) => village.gambleController(socket, input));


    socket.on('request user status', common.requestStatus);

    socket.on('load test', TEST.practice);

    socket.on('disconnect', () => common.disconnect(socket));
};

// export default onConnection;
