import { socket } from '../../socket.routes';
import { Monsters} from '../../db/models';
import { BattleService, CharacterService, MonsterService } from '../../services';
import { battleCache, redis } from '../../db/cache';
import { battle, dungeon } from '..';
import { UserSession } from '../../interfaces/user';
import { CommandRouter, ReturnScript } from '../../interfaces/socket';

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

    autoAttack: async (CMD: string | undefined, user: UserSession): Promise<ReturnScript> => {
        let tempScript: string = '';
        let field = 'action';
        const { characterId } = user;

        const { autoAttackId } = battleCache.get(characterId);
        const { monsterId } = await redis.hGetAll(characterId);
console.log(await redis.hGetAll(characterId))
        if (!autoAttackId) {
            return { script: '', field, user, error: true }
        }

        // 유저&몬스터 정보 불러오기
        const { hp: playerHP, attack: playerDamage } = await CharacterService.findByPk(characterId);
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

        const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');

        if (isDead === 'dead') {
            console.log('몬스터 사망');
            // battleCache.set(characterId, { dead: 'monster' });
            await redis.hSet(characterId, { dead: 'monster' });
            const { script, field, user } = await battle.resultMonsterDead(monster, tempScript);
            return { script, field, user };
        }

        // 몬스터 턴
        console.log('몬스터 턴');
        const monsterHit = BattleService.hitStrength(monsterDamage);
        const monsterAdjective = BattleService.dmageAdjective(
            monsterHit,
            monsterDamage,
        );
        tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;

        user = await CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
        if (user.isDead === 'dead') {
            console.log('유저 사망');

            field = 'adventureResult';
            tempScript += '\n!! 치명상 !!\n';
            tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
            // battleCache.set(characterId, { dead: 'player' });
            await redis.hSet(characterId, { dead: 'player' });
        }

        const script = tempScript;
        return { script, user, field };
    },

    resultMonsterDead: async(monster: Monsters, script: string) => {
        const { characterId, name: monsterName, exp: monsterExp } = monster;
        const user = await CharacterService.addExp(characterId, monsterExp!);
        const field = 'encounter';
        script += `\n${monsterName} 은(는) 쓰러졌다 ! => Exp + ${monsterExp}\n`;

        if (user.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${user.level - 1} => ${
                user.level
            } 올랐습니다 !! LEVEL UP !!==\n\n`;
        }

        return { script, user, field };
    },

    autoBattle: async(CMD: string | undefined, user: UserSession) => {
        let tempScript = ''
        let field = 'action';
        const { characterId } = user;
        console.log('autoBattleeeeeeeeeeeeeeeee', await redis.hGetAll(characterId))
        const { dungeonLevel } = await redis.hGetAll(characterId);
        // const { dungeonLevel } = battleCache.get(characterId);

        // 몬스터 생성
        const { monsterId, name } = await MonsterService.createNewMonster(dungeonLevel, characterId);
        const monsterCreatedScript = `\n${name}이(가) 등장했습니다.\n\n`;
        await redis.hSet(characterId, { monsterId });
        // battleCache.set(characterId, dungeonSession);
        console.log('몬스터 생성', await redis.hGetAll(characterId))

        socket.emit('printBattle', { script: monsterCreatedScript, field, user })

        // 자동공격 사이클
        const autoAttackId = setInterval(async () => {
            battleCache.set(characterId, { autoAttackId });
            const {script, user: newUser, error} = await battle.autoAttack(CMD, user);
            // 이미 끝난 전투
            if (error) return;

            // 자동공격 스크립트 계속 출력?
            const field = 'autoBattle';
            socket.emit('printBattle', { script, field, user: newUser });

            const whoIsDead: CommandRouter = {
                'player': dungeon.getDungeonList,
                'monster': battle.autoBattle,
            }
            // dead = 'moster'|'player'|undefined
            // const { dead } = battleCache.get(characterId);
            const { dead } = await redis.hGetAll(characterId);
            if (dead) {
                const { autoAttackId } = battleCache.get(characterId);
                clearInterval(autoAttackId);
                
                battleCache.delete(characterId);
                redis.hDelBattleCache(characterId)
                if (dead === 'monster') await redis.hSet(characterId, { dungeonLevel });

                const { script, field, user } = await whoIsDead[dead]('', newUser);
                socket.emit('printBattle', { script, field, user });

                return;
            } else {
                // 스킬공격 사이클. 50% 확률로 발생
                const chance = Math.random();
                if (chance < 0.5) return;
console.log('스킬 사용ㅇㅇㅇㅇㅇㅇㅇㅇㅇ', await redis.hGetAll(characterId))
                const { script, user, field} = await battle.autoBattleSkill(newUser);
                const { dead } = await redis.hGetAll(characterId);
                socket.emit('printBattle', { script, field, user });

                if (dead) {
                    console.log('스킬로 뒤짐ㅇㅇㅇㅇㅇㅇㅇㅇ', battleCache.get(characterId))
                    const { autoAttackId } = battleCache.get(characterId);
                    clearInterval(autoAttackId);
                    console.log('스킬에 뒤짐ㅇㅇㅇㅇㅇ', await redis.hGetAll(characterId))
                    battleCache.delete(characterId);
                    await redis.hDelResetCache(characterId);
                    console.log('reset Cache', await redis.hGetAll(characterId))
    console.log('레디스 리셋ㅇㅇㅇㅇㅇ', await redis.hGetAll(characterId))
                    const { script, field, user } = await whoIsDead[dead]('', newUser);
                    socket.emit('printBattle', { script, field, user });
    
                    return;
                }
            }
        }, 1500);

        // battleLoops.set(characterId, autoAttackId);

        // 스킬공격 사이클을 일반공격 사이클과 분리하는 것이 좋은가? 아니면 같은 사이클에서 돌리는 것이 나은가?
        // 일단 사망 판정 관리 때문에 하나로

        return { script: tempScript, user, field };
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
