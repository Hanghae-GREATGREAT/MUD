import { UserSession } from '../interfaces/user';
import redis from '../db/redis/config';
import { Monsters, Characters, Users } from '../db/models';
import { BattleService } from '../services';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    help: (CMD: string | undefined, user: UserSession) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

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
        let dead = '';
        let nextField = 'encounter';

        // 유저 정보 불러오기
        const characterStatus: any = await Characters.findByPk(
            user.characterId,
        );
        const playerHP: number = characterStatus?.hp;
        const playerDamage: number = characterStatus?.attack;
        // 몬스터 정보 불러오기
        const dungeonData = await redis.hGetAll(String(user.characterId));
        const monsterId: number = Number(dungeonData.monsterId);
        const monster: any = await Monsters.findByPk(monsterId);
        const monsterName: string = monster?.name;
        const monsterHP: number = monster?.hp;
        const monsterDamage: number = monster?.attack;
        const monsterExp: number = monster?.exp;

        // 유저 턴
        console.log('유저턴');
        const playerHit = BattleService.hitStrength(playerDamage);
        const playerAdjective = BattleService.dmageAdjective(
            playerHit,
            playerDamage,
        );
        tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;

        // 몬스터 사망 판정
        if (monsterHP - playerHit <= 0) {
            console.log('몬스터 사망');
            await Monsters.destroyMonster(Number(dungeonData.monsterId));
            await redis.hDel(String(user.characterId), 'monsterId');
            user =
                (await Characters.addExp(
                    Number(user.characterId),
                    monsterExp,
                )) || user;
            nextField = 'encounter';
            dead = 'monster';
            tempScript += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
            // 레벨 업 이벤트 발생
            if (user.levelup) {
                tempScript += `\n==!! LEVEL UP !! 레벨이 ${user.level - 1} => ${
                    user.level
                } 올랐습니다 !! LEVEL UP !!==\n\n`;
            }
        } else {
            console.log('몬스터 체력 감소 반영');
            await Monsters.changeMonsterStatus(monsterId, playerHit);

            // 몬스터 턴
            console.log('몬스터 턴');

            const monsterHit = BattleService.hitStrength(monsterDamage);
            const monsterAdjective = BattleService.dmageAdjective(
                monsterHit,
                monsterDamage,
            );
            tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
            // 유저 상태 업데이트
            user =
                (await Characters.refreshStatus(
                    Number(user.characterId),
                    monsterHit,
                    0,
                )) || user;

            // 유저 사망 판정
            if (playerHP - monsterHit <= 0) {
                console.log('유저 사망');
                await Monsters.destroyMonster(Number(dungeonData.monsterId));
                console.log('monster deleted')
                await redis.hDel(String(user.characterId), 'monsterId');
                console.log('redis deleted');

                nextField = 'adventureResult';
                tempScript += '\n!! 치명상 !!\n';
                tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
                dead = 'player';
            }
        }

        const script = tempScript;
        const field = nextField;
        return { script, user, field, dead };
    },

    skill: async (CMD: string | undefined, user: UserSession) => {
        let tempScript = '';
        let dead = '';

        const dungeonData = await redis.hGetAll(String(user.characterId));
        const characterId: number = Number(user.characterId);
        const characterStatus: any = await Characters.findByPk(characterId);
        const playerDamage: number = characterStatus.attack;
        const playerMP: number = characterStatus.mp;

        interface SikllForm {
            name: string;
            damage: number;
            cost: number;
        }

        // 임시 플레이어 스킬목록
        const plsyerskills: SikllForm[] = [
            { name: '컬랩스', damage: 115, cost: 25 },
            { name: '파이어', damage: 130, cost: 50 },
            { name: '파이라', damage: 150, cost: 100 },
            { name: '파이쟈', damage: 200, cost: 300 },
        ];

        const monsterId: number = Number(dungeonData.monsterId);
        const monster: any = await Monsters.findByPk(monsterId);
        const monsterName: string = monster.name;
        const monsterHP: number = monster.hp;
        const monsterExp: number = monster.exp;

        // 스킬 선택
        const selectedSkill: SikllForm = plsyerskills[Number(CMD) - 1];
        const skillName: string = selectedSkill.name;
        const damageRate: number = selectedSkill.damage;
        const skillCost: number = selectedSkill.cost;

        // 사용가능 마나 소지여부 확인
        if (playerMP - skillCost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
        } else {
            // 스킬 데미지 계산
            const playerSkillDamage: number = Math.floor(
                (playerDamage * damageRate) / 100,
            );
            const realDamage: number =
                BattleService.hitStrength(playerSkillDamage);

            // 스킬 Cost 적용
            user =
                (await Characters.refreshStatus(
                    Number(user.characterId),
                    0,
                    0,
                )) || user;

            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

            // 몬스터 데미지 적용
            if (monsterHP - realDamage > 0) {
                console.log('몬스터 체력 감소 반영');
                await Monsters.changeMonsterStatus(monsterId, realDamage);
            } else {
                console.log('몬스터 사망');
                await Monsters.destroyMonster(Number(dungeonData.monsterId));
                await redis.hDel(String(user.characterId), 'monsterId');
                user =
                    (await Characters.addExp(
                        Number(user.characterId),
                        monsterExp,
                    )) || user;
                dead = 'monster';
                tempScript += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
                // 레벨 업 이벤트 발생
                if (user.levelup) {
                    tempScript += `\n==!! LEVEL UP !! 레벨이 ${
                        user.level - 1
                    } => ${user.level} 올랐습니다 !! LEVEL UP !!==\n\n`;
                }
            }
        }

        const script = tempScript;
        const field = 'encounter';
        return { script, user, field, dead };
    },

    auto: (CMD: string | undefined, user: UserSession) => {
        const script = 'tempScript';
        const field = 'home';
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
