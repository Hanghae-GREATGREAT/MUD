import { UserSession } from '../../interfaces/user';
import { CharacterService, MonsterService } from '../../services';
import { redis } from '../../db/cache';
import { ReturnScript } from '../../interfaces/socket';


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
        const { characterId } = user;
        const { dungeonLevel } = await redis.hGetAll(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(dungeonLevel, characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        await redis.hSet(characterId, { monsterId });

        const script = tempLine + tempScript;
        const field = 'encounter';

        return { script, user, field };
    }

    reEncounter = async (CMD: string, user: UserSession): Promise<ReturnScript> => {
        // 던전 진행상황 불러오기
        const { characterId } = user;
        const { dungeonLevel } = await redis.hGetAll(characterId);
        // const { dungeonLevel } = battleCache.get(characterId);

        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        // 적 생성
        const { name, monsterId } = await MonsterService.createNewMonster(dungeonLevel, characterId);
        tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
        tempScript += `[공격] 하기\n`;
        tempScript += `[도망] 가기\n`;

        // 던전 진행상황 업데이트
        await redis.hSet(characterId, { monsterId });

        const script = tempLine + tempScript;
        const field = 'encounter';
        user = await CharacterService.addExp(characterId, 0);
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