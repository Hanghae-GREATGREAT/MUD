import { socket } from '../socket.routes';
import { battle, dungeon } from '../handler';
import { LineInput, CommandRouter } from '../interfaces/socket';


export default {

    battleController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon battle');

        const commandRouter: CommandRouter = {
            도움말: battle.help,
            수동: battle.encounter,
            자동: battle.autoBattle,
            돌: dungeon.getDungeonList,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    },

    encounterController: async ({ line, user }: LineInput) => {
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
            const result = battle.wrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        let result = await commandRouter[CMD1](CMD2, user);
        const target = result.field === 'action' ? 'printBattle' : 'print';
        socket.emit(target, result);
    },

    actionController: async({ line, user, option }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        /**
         * action:time
         * 타임스탬프를 함께 전달하고 이를 바탕으로 스킬 재사용 가능여부 판별
         */

        const result = await battle.actionSkill(CMD1, user);
        if (Object.hasOwn(result, 'error')) {
            return socket.emit('print', result);
        }  
        if (!result.dead) {
            result.cooldown = Date.now();            
            return socket.emit('printBattle', result);
        }

        const deadResult = await battle.reEncounter('', result.user);
        deadResult.script = result.script + deadResult.script;
        socket.emit('print', deadResult);
    },

    autoBattleController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');
        console.log('socketon enccounter');

        const commandRouter: CommandRouter = {
            도움말: battle.autoBattleHelp,
            중단: battle.quitAutoBattle,
        };
        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = await commandRouter['도움말'](CMD1, user);
            return socket.emit('print', result);
        }

        let result = await commandRouter[CMD1](CMD2, user);
        const target = result.field === 'action' ? 'printBattle' : 'print';
        socket.emit(target, result);
    },

    resultController: async ({ line, user }: LineInput) => {
        const [CMD1, CMD2]: string[] = line.trim().split(' ');

        const commandRouter: CommandRouter = {
            load: battle.adventureload,
            확인: battle.getDetail,
            마을: battle.returnVillage,
        };

        if (!commandRouter[CMD1]) {
            console.log(`is wrong command : '${CMD1}'`);
            const result = battle.adventureWrongCommand(CMD1, user);
            return socket.emit('print', result);
        }

        const result = await commandRouter[CMD1](CMD2, user);
        socket.emit('print', result);
    }
}










// const newScript: CommandRouter = {
        //     monster: battle.encounter,
        //     player: dungeon.getDungeonList,
        // };

        // // let result;
        // if (CMD1 === '공격') {
        //     const basicFight = setInterval(async () => {
        //         result = await battle.manualLogic(CMD2, user);
        //         socket.emit('printBattle', result);
        //         if (result.dead.match(/player|monster/)) {
        //             clearInterval(battleLoops[user.characterId]);
        //             result = await newScript[result.dead](CMD2, user)
        //             socket.emit('print', result);
        //         }
        //     }, 1500);
        //     battleLoops[user.characterId] = basicFight;
        // } else if (CMD1 === '스킬') {
        //     result = await battle.skill(CMD2, user);

        //     if (result.dead.match(/player|monster/)) {
        //         socket.emit('print', result);
        //         clearInterval(battleLoops[user.characterId]);
        //         result = await newScript[result.dead](CMD2, user);
        //     }
        // } else if (!commandRouter[CMD1]) {
        //     console.log(`is wrong command : '${CMD1}'`);
        //     result = battle.ewrongCommand(CMD1, user);
        // } else {
        //     result = await commandRouter[CMD1](CMD2, user);
        // }