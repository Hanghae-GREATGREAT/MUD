import { UserSession } from '../interfaces/user';
import redis from '../db/redis/config';
import { Monsters } from '../db/models';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    help: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += '명령어 : \n';
        tempScript += '[수동] 전투 진행 - 수동 전투를 진행합니다.\n';
        tempScript += '[자동] 전투 진행 - 자동 전투를 진행합니다.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'battle';

        return { script, user, field };
    },

    manualLogic: async (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        let nextField = 'encounter';

        // 유저 정보 불러오기
        let userHP: number = 100;
        // 몬스터 정보 불러오기
        const dungeonData = await redis.hGetAll(String(user.characterId));
        console.log(dungeonData);
        let monsterHP: number = 100;

        // 유저 턴
        console.log('유저턴');
        tempScript += '당신은 몬스터를 후려쳤다. => 72의 데미지!\n';
        // 몬스터 사망 판정
        let randomEvent = Math.floor(Math.random() * 100);
        if (randomEvent > 20) {
            console.log('몬스터 사망');
            await Monsters.destroyMonster(Number(dungeonData.monsterId));
            await redis.hDel(String(user.characterId), 'monsterId');
            monsterHP = 0;
            tempScript += '몬스터가 쓰러졌다 ! => Exp + 10\n';
            nextField = 'encounter';
        }
        // 몬스터 턴
        if (monsterHP > 0) {
            console.log('몬스터 턴');
            tempScript +=
                '몬스터는 당신을 향해 날카로운 이빨을 드러내며 돌진한다. => 19의 데미지!\n';

            // 유저 사망 판정
            randomEvent = Math.floor(Math.random() * 100);
            if (randomEvent > 20) {
                await Monsters.destroyMonster(Number(dungeonData.monsterId));
                await redis.hDel(String(user.characterId), 'monsterId');
                console.log('유저 사망');
                userHP = 0;
                nextField = 'dungeon';
                tempScript += '으악 ! 당신은 죽어버렸다.\n';
            }
        }

        const script = tempScript;
        const field = nextField;
        return { script, user, field };
    },

    auto: (CMD: string | undefined, user: UserSession) => {
        const script = 'tempScript';
        const field = 'battle';
        return { script, user, field };
    },

    wrongCommand: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'battle';
        return { script, user, field };
    },
};
