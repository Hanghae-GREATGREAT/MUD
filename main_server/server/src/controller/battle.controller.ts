import { Socket } from 'socket.io';
import { battle, dungeon } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';
import { battleCache } from '../db/cache';

export default {

    battleController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        console.log('battle.controller.ts: battleController', userStatus.name);
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '자동1') {
            console.log('battle.controller.ts: 자동 분기점');
            battle.autoBattle(socket, CMD2, userStatus);
            return;
        }
        const commandHandler: CommandHandler = {
            '도움말': battle.help,
            '수동': battle.encounter,
            '자동': battle.autoBattleOld,
            '돌': dungeon.getDungeonList,
        };

        if (!commandHandler[CMD1]) {
            battle.wrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    encounterController: async (socket: Socket, { line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            'LOAD': battle.encounter,
            '도움말': battle.ehelp,
            '공격': battle.attack,
            '도망': battle.quitBattle,
        };
        if (!commandHandler[CMD1]) {
            battle.wrongCommand(socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo, userStatus);
    },

    actionController: async(socket: Socket, { line, userInfo, userStatus, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const { characterId } = userInfo;

        if (CMD1 === '중단') {
            battle.quitAutoBattle(socket, '', userInfo);
            return;
        }

        await battle.actionSkill(socket, CMD1, userInfo, userStatus);

        const {  autoAttackTimer, dungeonLevel, dead } = battleCache.get(characterId);
        if (dead) {
            clearInterval(autoAttackTimer);
            battleCache.delete(characterId);
            battleCache.set(characterId, { dungeonLevel });

            battle.reEncounter(socket, '', userInfo);
            return;
        }        
    },

    autoBattleController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandHandler: CommandHandler = {
            '도움말': battle.autoBattleHelp,
            '중단': battle.quitAutoBattle,
        };
        if (!commandHandler[CMD1]) {
            commandHandler['도움말'](socket, CMD1, userInfo);
            return;
        }

        commandHandler[CMD1](socket, CMD2, userInfo);
    },

    resultController: async (socket: Socket, { line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            'LOAD': battle.adventureload,
            '확인': battle.getDetail,
            '마을': battle.returnVillage,
        };

        if (!commandHandler[CMD1]) {
            battle.adventureWrongCommand(socket, CMD1, userInfo);
            return;
        }
        commandHandler[CMD1](socket, CMD2, userInfo);
    }
}