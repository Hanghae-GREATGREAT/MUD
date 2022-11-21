import { socket } from '../socket.routes';
import { battle, dungeon } from '../handler';
import { LineInput, CommandRouter } from '../interfaces/socket';
import { battleCache } from '../db/cache';

export default {

    battleController: async ({ line, userCache }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        if (CMD1 === '자동1') {
            console.log('battle.controller.ts: 26 >> 자동 분기점');
            battle.autoBattle(CMD2, userCache);
            return;
        }
        const commandRouter: CommandRouter = {
            도움말: battle.help,
            수동: battle.encounter,
            자동: battle.autoBattleOld,
            돌: dungeon.getDungeonList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, userCache);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, userCache);
        socket.emit('print', result);
    },

    encounterController: async ({ line, userCache }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandRouter: CommandRouter = {
            load: battle.encounter,
            도움말: battle.ehelp,
            공격: battle.attack,
            도망: battle.quitBattle,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, userCache);
            return socket.emit('print', result);
        }

        let result = await commandRouter[CMD1](CMD2, userCache);
        const target = result!.field === 'action' ? 'printBattle' : 'print';
        socket.emit(target, result);
    },

    actionController: async({ line, userCache, option }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        const { characterId } = userCache;

        if (CMD1 === '중단') {
            const result = await battle.quitAutoBattle('', userCache);
            const field = result.field === 'action' ? 'printBattle' : 'print';
            socket.emit(field, result);
        }
        
        const result = await battle.actionSkill(CMD1, userCache);
        if (Object.hasOwn(result, 'error')) {
            return socket.emit('print', result);
        }

        const {  autoAttackTimer, dungeonLevel, dead } = battleCache.get(characterId);
        if (dead) {
            clearInterval(autoAttackTimer);
            battleCache.delete(characterId);
            battleCache.set(characterId, { dungeonLevel });

            const deadResult = await battle.reEncounter('', result.userCache);
            deadResult.script = result.script + deadResult.script;
            socket.emit('print', deadResult);
            
            return;
        }        

        result.cooldown = Date.now();
        return socket.emit('printBattle', result);
    },

    autoBattleController: async ({ line, userCache }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandRouter: CommandRouter = {
            도움말: battle.autoBattleHelp,
            중단: battle.quitAutoBattle,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = await commandRouter['도움말'](CMD1, userCache);
            return socket.emit('print', result);
        }

        let result = await commandRouter[CMD1](CMD2, userCache);
        const target = result!.field === 'action' ? 'printBattle' : 'print';
        socket.emit(target, result);
    },

    resultController: async ({ line, userCache }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandRouter: CommandRouter = {
            load: battle.adventureload,
            확인: battle.getDetail,
            마을: battle.returnVillage,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.adventureWrongCommand(CMD1, userCache);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, userCache);
        socket.emit('print', result);
    }
}