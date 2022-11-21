import { battle, dungeon } from '..';
import { battleCache } from '../../db/cache';
import { Skills } from '../../db/models';
import { UserCache } from '../../interfaces/user';
import { BattleService, CharacterService, MonsterService } from '../../services';
import { socket } from '../../socket.routes';
import { setEnvironmentData } from 'worker_threads'
import { BattleResult, CommandRouter } from '../../interfaces/socket';
import { autoAttack, isMonsterDead, skillAttack } from '../../workers';



export default {

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

    autoBattle: async(CMD: string | undefined, userCache: UserCache) => {
        const { characterId } = userCache;
        console.log('battle.handler.ts: 자동전투 핸들러 시작, ', characterId);
        const { dungeonLevel } = battleCache.get(characterId);

        // 몬스터 생성
        const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel!, characterId);
        const monsterCreatedScript = `\n${name}이(가) 등장!! 전투시작.`;
        battleCache.set(characterId, { monsterId });
        console.log('battle.handler.ts: ', monsterCreatedScript)

        socket.emit('printBattle', { script: monsterCreatedScript, field: 'autoBattle', userCache });

        const cache = battleCache.get(characterId);
        setEnvironmentData(characterId, JSON.stringify(cache));

        const { port1: autoToDead, port2: autoToDeadReceive } = new MessageChannel();
        const { port1: skillToDead, port2: skillToDeadReceive } = new MessageChannel();
        const receiver = { autoToDeadReceive, skillToDeadReceive };

        // 사망판정 워커 할당 >> 소켓 송신
        isMonsterDead.check(userCache, receiver).then(({ status, script}) => {
            console.log('battle.handler.ts: 사망 확인 resolved', status, characterId);

            if (status === 'terminate') {
                console.log('battle.handler.ts: 자동전투 강제종료', script)
                return;
            }

            const battleResult: BattleResult = {
                monster: battle.autoResultMonsterDead,
                player: battle.autoResultPlayerDead
            }
            battleResult[status](userCache, script);
        }).catch((error) => console.error(error));

        // 자동공격 워커 할당
        autoAttack.start(userCache, autoToDead).then((result) => {
            console.log('battle.handler.ts: 자동 공격 resolved', result, characterId);
        }).catch(error => console.error(error));

        // 스킬공격 워커 할당
        skillAttack.start(userCache, skillToDead).then((result) => {
            console.log('battle.handler.ts: 스킬 공격 resolved', result, characterId);
        }).catch(error => console.error(error));

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


    // DEPRECATED
    // (구)자동전투용으로 완전 대체 이후 삭제
    autoBattleOld: async(CMD: string | undefined, userCache: UserCache) => {

        let tempScript = ''
        let field = 'autoBattle';
        const { characterId } = userCache;
        const { dungeonLevel } = battleCache.get(characterId);

        // 몬스터 생성
        const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel!, characterId);
        const monsterCreatedScript = `\n${name}이(가) 등장했습니다.\n\n`;
        battleCache.set(characterId, { monsterId });

        socket.emit('printBattle', { script: monsterCreatedScript, field, userCache })

        // 자동공격 사이클
        const autoAttackTimer = setInterval(async () => {

            battleCache.set(characterId, { autoAttackTimer });
            const {script, userCache: newUser, error} = await battle.autoAttack(CMD, userCache);
            // 이미 끝난 전투
            if (error) return;

            // 자동공격 스크립트 계속 출력?
            const field = 'autoBattle';
            socket.emit('printBattle', { script, field, userCache: newUser });

            const whoIsDead: CommandRouter = {
                'player': dungeon.getDungeonList,
                'monster': battle.autoBattleOld,
            }
            // dead = 'moster'|'player'|undefined
            const { dead } = battleCache.get(characterId);
            if (dead) {
                const { autoAttackTimer, dungeonLevel } = battleCache.get(characterId);
                clearInterval(autoAttackTimer);
                
                battleCache.delete(characterId);
                await MonsterService.destroyMonster(monsterId, characterId);
                if (dead === 'monster') battleCache.set(characterId, { dungeonLevel });

                const { script, field, userCache } = await whoIsDead[dead]('', newUser);
                socket.emit('printBattle', { script, field, userCache });

                return;
            } else {
                // 스킬공격 사이클. 50% 확률로 발생
                const chance = Math.random();
                if (chance < 0.5) return;

                const { script, userCache, field} = await battle.autoBattleSkill(newUser);
                const { dead } = battleCache.get(characterId);
                socket.emit('printBattle', { script, field, userCache });

                if (dead) {
                    const { autoAttackTimer, dungeonLevel } = battleCache.get(characterId);
                    clearInterval(autoAttackTimer);

                    battleCache.delete(characterId);
                    await MonsterService.destroyMonster(monsterId, characterId);
                    if (dead === 'monster') battleCache.set(characterId, { dungeonLevel });

                    const { script, field, userCache } = await whoIsDead[dead]('', newUser);
                    socket.emit('printBattle', { script, field, userCache });
    
                    return;
                }
            }
        }, 1500);

        // battleLoops.set(characterId, autoAttackTimer);

        // 스킬공격 사이클을 일반공격 사이클과 분리하는 것이 좋은가? 아니면 같은 사이클에서 돌리는 것이 나은가?
        // 일단 사망 판정 관리 때문에 하나로

        return { script: tempScript, userCache, field };
    },

    // DEPRECATED
    // (구)자동전투용으로 완전 대체 이후 삭제
    autoBattleSkill: async (userCache: UserCache) => {
        console.log('autoBattleSkill')
        const { characterId, mp, attack } = userCache
        let field = 'autoBattle';
        let tempScript = '';

        // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
        const { skill } = await CharacterService.findByPk(characterId);
        const selectedSkill = battle.skillSelector(skill);
        const { name: skillName, cost: skillCost, multiple } = selectedSkill;

        // 몬스터 정보 가져오기
        // const { monsterId } = await redis.hGetAll(characterId);
        const { monsterId } = battleCache.get(characterId);
        if (!monsterId) throw new Error('몬스터 정보가 없습니다.');
        const monster = await MonsterService.findByPk(monsterId);
        if (!monster) throw new Error('몬스터 정보가 없습니다.');
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

        // 마나 잔여량 확인
        if (mp - skillCost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
            const script = tempScript;
            return { script, userCache, field };
        }

        // 스킬 데미지 계산 & 마나 cost 소모
        const playerSkillDamage: number = Math.floor(
            (attack * multiple) / 100,
        );
        const realDamage: number = BattleService.hitStrength(playerSkillDamage);
        userCache = await CharacterService.refreshStatus(characterId, 0, skillCost, monsterId);

        // 몬스터에게 스킬 데미지 적중
        const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');
        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        if (isDead === 'dead') {
            console.log('몬스터 사망');
            battleCache.set(characterId, { dead: 'monster' });
            // await redis.hSet(characterId, { dead: 'monster' });
            return await battle.resultMonsterDead(monster, tempScript);
        }

        // isDead === 'alive'
        const script = tempScript;
        return { script, userCache, field };
    },

    // DEPRECATED
    // (구)자동전투용으로 완전 대체 이후 삭제
    skillSelector: (skill: Skills[]) => {
        const skillCounts = skill.length;
        const skillCosts = skill.map((s: Skills)=>s.cost);        
        const costSum = skillCosts.reduce((a: number, b: number)=>a+b, 0);
        const chanceSum = skillCosts.reduce((a: number, b: number) => {
            return a + costSum/b
        }, 0);

        const chance = Math.random();
        let skillIndex = 0;
        let cumChance =  0;
        for (let i=0; i<skillCounts; i++) {
            const singleChance = (costSum / skillCosts[i]) / chanceSum
            cumChance += singleChance;
            console.log(chance, cumChance)
            if (chance <= cumChance) {
                skillIndex = i;
                break;
            }
        }

        return skill[skillIndex];
    }
}