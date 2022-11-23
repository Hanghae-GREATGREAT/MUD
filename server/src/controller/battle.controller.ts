import { socket } from '../socket.routes';
import { battle, dungeon } from '../handler';
import { SocketInput, CommandHandler } from '../interfaces/socket';
import { battleCache } from '../db/cache';

export default {

    battleController: async ({ line, userInfo, userStatus }: SocketInput) => {
        console.log('battle.controller.ts: battleController', userStatus);
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        if (CMD1 === '자동1') {
            console.log('battle.controller.ts: 자동 분기점');
            battle.autoBattle(CMD2, userStatus);
            return;
        }
        const commandHandler: CommandHandler = {
            '도움말': battle.help,
            '수동': battle.encounter,
            '자동': battle.autoBattleOld,
            '돌': dungeon.getDungeonList,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    encounterController: async ({ line, userInfo, userStatus }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            'LOAD': battle.encounter,
            '도움말': battle.ehelp,
            '공격': battle.attack,
            '도망': battle.quitBattle,
        };
        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, userInfo);
            return socket.emit('print', result);
        }

        commandHandler[CMD1](CMD2, userInfo, userStatus);
    },

    actionController: async({ line, userInfo, userStatus, option }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const { characterId } = userInfo;

        if (CMD1 === '중단') battle.quitAutoBattle('', userInfo);
        
        await battle.actionSkill(CMD1, userInfo, userStatus);

        const {  autoAttackTimer, dungeonLevel, dead } = battleCache.get(characterId);
        if (dead) {
            clearInterval(autoAttackTimer);
            battleCache.delete(characterId);
            battleCache.set(characterId, { dungeonLevel });

            battle.reEncounter('', userInfo);
            return;
        }        
    },

    autoBattleController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandHandler: CommandHandler = {
            '도움말': battle.autoBattleHelp,
            '중단': battle.quitAutoBattle,
        };
        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = await commandHandler['도움말'](CMD1, userInfo);
            return socket.emit('print', result);
        }

        let result = await commandHandler[CMD1](CMD2, userInfo);
    },

    resultController: async ({ line, userInfo }: SocketInput) => {
        const [CMD1, CMD2]: string[] = line.trim().toUpperCase().split(' ');

        const commandHandler: CommandHandler = {
            'LOAD': battle.adventureload,
            '확인': battle.getDetail,
            '마을': battle.returnVillage,
        };

        if (!commandHandler[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            battle.adventureWrongCommand(CMD1, userInfo);
        }
        commandHandler[CMD1](CMD2, userInfo);
    }
}