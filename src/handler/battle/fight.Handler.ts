import { UserCache } from '../../interfaces/user';
import { MonsterService } from '../../services';
import { battleCache } from '../../db/cache';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    battleHelp: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';

        // tempScript += '\n명령어 : \n';
        // tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        // tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
        tempScript += `\n잘못된 명령입니다.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += '---전투 중 명령어---\n';
        tempScript += '스킬[1] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';
        tempScript += '스킬[2] 사용 - 2번 슬롯에 장착된 스킬을 사용합니다.\n';
        tempScript += '스킬[3] 사용 - 3번 슬롯에 장착된 스킬을 사용합니다.\n';

        const script = tempScript;
        const field = 'action';
        return { script, userCache, field };
    },

    autoBattleHelp: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';

        // tempScript += '\n명령어 : \n';
        // tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += `\n잘못된 명령입니다.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += '---전투 중 명령어---\n';
        tempScript += '[중단] 하기 - 전투를 중단하고 마을로 돌아갑니다.\n';

        const script = tempScript;
        const field = 'action';
        return { script, userCache, field };
    },

    quitBattle: async (CMD: string | undefined, userCache: UserCache) => {
        const { characterId } = userCache;
        // const { monsterId } = await redis.hGetAll(characterId);
        const { monsterId } = battleCache.get(characterId);
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += `당신은 도망쳤습니다. \n\n`;
        tempScript += `??? : 하남자특. 도망감.\n`;

        // 몬스터 삭제
        MonsterService.destroyMonster(monsterId!, +characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, userCache, field };
    },

    quitAutoBattle: async (CMD: string | undefined, userCache: UserCache) => {
        const { characterId } = userCache;
        const { monsterId } = battleCache.get(characterId);
        // const { monsterId } = await redis.hGetAll(characterId);
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += `전투를 중단하고 마을로 돌아갑니다. \n\n`;

        // 기본공격 중단 & 몬스터 삭제
        // 이벤트 루프에 이미 들어가서 대기중인 타이머가 있을 수 있음
        const { autoAttackTimer } = battleCache.get(characterId);
        clearInterval(autoAttackTimer);       
        console.log('자동공격 타이머 삭제', autoAttackTimer);
        if (autoAttackTimer === undefined) {
            setTimeout(() => {
                const { autoAttackTimer } = battleCache.get(characterId);
                clearInterval(autoAttackTimer);
                console.log('자동공격 타이머 삭제', autoAttackTimer);
            }, 300);
        }
        battleCache.delete(characterId);
        MonsterService.destroyMonster(monsterId!, characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, userCache, field };
    },

    fwrongCommand: (CMD: string | undefined, userCache: UserCache) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, userCache, field };
    },
};
