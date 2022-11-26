import { Socket } from 'socket.io';
import { battle, chat, common, field, home, TEST, village, pvpBattle } from './controller';
import { ChatInput, SocketInput } from './interfaces/socket';


const onConnection = (socket: Socket) => {
    console.log('SOCKET CONNECTED', socket.id);

    /************************************************************************
                                    홈                                      
     ************************************************************************/

    socket.on('none', (input: SocketInput) => home.noneController(socket, input));

    socket.on('front', (input: SocketInput) => home.frontController(socket, input));

    socket.on('sign', (input: SocketInput) => home.signController(socket, input));

    /************************************************************************
                                    필드                                      
     ************************************************************************/

    socket.on('dungeon', (input: SocketInput) => field.dungeonController(socket, input));

    socket.on('village', (input: SocketInput) => field.villageController(socket, input));
    /************************************************************************
                                    마을                                      
     ************************************************************************/

    socket.on('story', (input: SocketInput) => village.storyController(socket, input));

    socket.on('heal', (input: SocketInput) => village.healController(socket, input));

    socket.on('enhance', (input: SocketInput) => village.enhanceController(socket, input));

    socket.on('gamble', (input: SocketInput) => village.gambleController(socket, input));

    socket.on('pvp', (input: SocketInput) => village.pvpController(socket, input));

    /************************************************************************
                                    전투                                      
     ************************************************************************/

    socket.on('battle', (input: SocketInput) => battle.battleController(socket, input));

    socket.on('encounter', (input: SocketInput) => battle.encounterController(socket, input));

    socket.on('action', (input: SocketInput) => battle.actionController(socket, input));

    socket.on('autoBattle', (input: SocketInput) => battle.autoBattleController(socket, input));

    /************************************************************************
                                   모험 종료                                      
     ************************************************************************/

    socket.on('adventureResult', (input: SocketInput) => battle.resultController(socket, input));

    /************************************************************************
                                   시련의 장                                      
     ************************************************************************/

    socket.on('pvpList', (input: SocketInput) => pvpBattle.pvpListController(socket, input))

    socket.on('pvpBattle', (input: SocketInput) => pvpBattle.pvpBattleController(socket, input));

    socket.on('enemyChoice', (input: SocketInput) => pvpBattle.enemyChoiceController(socket, input));

    socket.on('attackChoice', (input: SocketInput) => pvpBattle.attackChoiceController(socket, input));

    socket.on('anemyAttack', (input: SocketInput) => pvpBattle.anemyAttackController(socket, input));

    /************************************************************************
                                    시련의 장 종료                                    
    ************************************************************************/

    socket.on('pvpResult', (input: SocketInput) => pvpBattle.pvpResultController(socket, input));

    /************************************************************************
                                    채팅박스                                      
     ************************************************************************/

    socket.on('submit', (input: ChatInput) => chat.chatController(socket, input));

    /************************************************************************
                                    기타                                      
     ************************************************************************/

    socket.on('request user status', common.requestStatus);

    socket.on('load test', TEST.practice);

    socket.on('disconnect', () => common.disconnect(socket));
};

export default onConnection;
