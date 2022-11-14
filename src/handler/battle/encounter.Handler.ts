import { UserSession } from '../../interfaces/user';
import { BattleService, CharacterService, MonsterService } from '../../services';
import { battleCache, redis } from '../../db/cache';
import { Monsters } from '../../db/models';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';
import battle from './battle.Handler'
import { dungeon } from '../../handler';
import { socket } from '../../socket.routes'

class EncounterHandler {
    // help: (CMD: string | undefined, user: UserSession) => {}
    ehelp = (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += '명령어 : \n';
        tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
        tempScript += '---전투 중 명령어---\n';
        tempScript +=
            '[스킬] [num] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';

        const script = tempScript;
        const field = 'encounter';
        return { script, user, field };
    }

    encounter = async (CMD: string | undefined, user: UserSession): Promise<ReturnScript> => {
        // 던전 진행상황 불러오기
        const characterId = user.characterId.toString();
        const { dungeonLevel } = await redis.hGetAll(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';
console.log(characterId, dungeonLevel);
        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(+dungeonLevel, +characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        await redis.hSet(characterId, { monsterId });

        const script = tempLine + tempScript;
        const field = 'encounter';

        return { script, user, field };
    }

    attack = async(CMD: string | undefined, user: UserSession) => {
        const whoIsDead: CommandRouter = {
            // back to dungeon list when player died
            player: dungeon.getDungeonList,
            // back to encounter phase when monster died
            monster: this.reEncounter,
        }
        const characterId = user.characterId.toString();

        const autoAttackId = setInterval(async () => {
            battleCache.set(characterId, { autoAttackId });
            const { script, field, user: newUser, error } = await battle.autoAttack(CMD, user);
            if (error) return;
            socket.emit('printBattle', { script, field, user: newUser });

            // const { dead } = battleCache.get(characterId);
            const { dead } = await redis.hGetAll(characterId);
            // dead = 'moster'|'player'|undefined
            if (dead) {
                redis.hDelResetCache(characterId);
                const { autoAttackId } = battleCache.get(characterId)
                clearInterval(autoAttackId);
                battleCache.delete(characterId);

                const result = await whoIsDead[dead]('', newUser);
                socket.emit('print', result);

                return;
            }
        }, 1500);

        return { script: '', user, field: 'action', cooldown: Date.now()-2000 }
    }

    reEncounter = async (CMD: string, user: UserSession): Promise<ReturnScript> => {
        // 던전 진행상황 불러오기
        const characterId = user.characterId.toString();
        const { dungeonLevel } = await redis.hGetAll(characterId);
        // const { dungeonLevel } = battleCache.get(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';
console.log(dungeonLevel, characterId)
        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(+dungeonLevel, +characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        await redis.hSet(characterId, { monsterId });

        const script = tempLine + tempScript;
        const field = 'encounter';
        user = await CharacterService.addExp(+characterId, 0);
        return { script, user, field };
    }

    run = async (CMD: string | undefined, user: UserSession) => {
        console.log('도망 실행');
        const characterId = user.characterId.toString();
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += `... 몬스터와 눈이 마주친 순간,\n`;
        tempScript += `당신은 던전 입구를 향해 필사적으로 뒷걸음질쳤습니다.\n\n`;
        tempScript += `??? : 하남자특. 도망감.\n\n`;
        tempScript += `목록 - 던전 목록을 불러옵니다.\n`;
        tempScript += `입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`;

        // 몬스터 삭제
        // await MonsterService.destroyMonster(Number(dungeonSession.monsterId));
        redis.hDelBattleCache(characterId);
        battleCache.delete(characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    }

    ewrongCommand = (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, user, field };
    }
};

export const battleLoops: Map<string|number, NodeJS.Timer> = new Map();


export default new EncounterHandler();