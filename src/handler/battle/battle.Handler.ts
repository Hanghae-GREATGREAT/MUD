import { UserSession } from '../../interfaces/user';
import redis from '../../db/redis/config';
import { Monsters, Characters, Users } from '../../db/models';
import { BattleService, CharacterService, MonsterService } from '../../services';
import battle from '.';

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
        let dead: string | undefined;
        let field = 'action';
        const { characterId } = user;

        // 유저&몬스터 정보 불러오기
        const { hp: playerHP, attack: playerDamage } = await CharacterService.findByPk(characterId);
        const { monsterId } = await redis.hGetAll(String(characterId));
        const monster = await Monsters.findByPk(monsterId);
        if (!monster) throw new Error('몬스터 정보 불러오기 실패');
        const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;

        // 유저 턴
        console.log('유저턴');
        const playerHit = BattleService.hitStrength(playerDamage);
        const playerAdjective = BattleService.dmageAdjective(
            playerHit,
            playerDamage,
        );
        tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;

        const isDead = await MonsterService.refreshStatus(+monsterId, playerHit, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');

        if (isDead === 'dead') {
            console.log('몬스터 사망');
            return await battle.resultMonsterDead(monster, tempScript)
        }

        // 몬스터 턴
        console.log('몬스터 턴');
        const monsterHit = BattleService.hitStrength(monsterDamage);
        const monsterAdjective = BattleService.dmageAdjective(
            monsterHit,
            monsterDamage,
        );
        tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;

        user = await CharacterService.refreshStatus(characterId, monsterHit, 0, +monsterId);
        if (user.isDead === 'dead') {
            console.log('유저 사망');

            field = 'adventureResult';
            tempScript += '\n!! 치명상 !!\n';
            tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
            dead = 'player';
        }

        const script = tempScript;
        return { script, user, field, dead };
    },

    skill: async (CMD: string | undefined, user: UserSession) => {
        let tempScript = '';
        let dead = '';
        const { characterId } = user;

        const dungeonData = await redis.hGetAll(String(characterId));
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
            user = await CharacterService.refreshStatus(characterId, 0, 0, +monsterId) || user;

            tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

            // 몬스터 데미지 적용
            if (monsterHP - realDamage > 0) {
                console.log('몬스터 체력 감소 반영');
                await MonsterService.refreshStatus(monsterId, realDamage, characterId);
            } else {
                console.log('몬스터 사망');
                // await MonsterService.destroyMonster(Number(dungeonData.monsterId));
                await redis.hDel(String(characterId), 'monsterId');

                user = await CharacterService.addExp(characterId, monsterExp) || user;
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

    resultMonsterDead: async(monster: Monsters, script: string) => {
        const { characterId, name: monsterName, exp: monsterExp } = monster;
        const user = await CharacterService.addExp(characterId, monsterExp!);
        const field = 'encounter';
        script += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;
        const dead = 'monster';

        if (user.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${user.level - 1} => ${
                user.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

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
