import { socket } from '../../socket.routes';
import { battleCache } from '../../db/cache';
import { Monsters} from '../../db/models';
import { BattleService, CharacterService, MonsterService } from '../../services';
import { battle, dungeon } from '..';
import { UserInfo, UserStatus } from '../../interfaces/user';
import { CommandHandler } from '../../interfaces/socket';

export default {
    // help: (CMD: string | undefined, user: UserSession) => {}
    help: (CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        let tempScript: string = '';
        const tempLine =
            '=======================================================================\n';

        tempScript += '명령어 : \n';
        tempScript += '[수동] 전투 진행 - 수동 전투를 진행합니다.\n';
        tempScript += '[자동] 전투 진행 - 자동 전투를 진행합니다.\n';
        tempScript += '[돌]아가기 - 이전 단계로 돌아갑니다.\n';

        const script = tempLine + tempScript;
        const field = 'battle';

        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    battleHelp: (CMD: string | undefined, userInfo: UserInfo) => {
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

        socket.emit('print', { script, userInfo, field });
    },

    // 일반전투 '공격'
    attack: async(CMD: string | undefined, userInfo: UserInfo, userStatus: UserStatus) => {
        const whoIsDead: CommandHandler = {
            // back to dungeon list when player died
            player: dungeon.getDungeonList,
            // back to encounter phase when monster died
            monster: battle.reEncounter,
        }
        const { characterId } = userInfo;

        const autoAttackTimer = setInterval(async () => {
            battleCache.set(characterId, { autoAttackTimer });
            const { script, field, userStatus: newStatus, error } = await battle.autoAttack(CMD, userStatus);
            if (error) return;
            socket.emit('printBattle', { script, field, userInfo, userStatus: newStatus });

            const { dead } = battleCache.get(characterId);
            // dead = 'moster'|'player'|undefined
            if (dead) {
                const { autoAttackTimer, dungeonLevel } = battleCache.get(characterId)
                clearInterval(autoAttackTimer);
                battleCache.delete(characterId);
                battleCache.set(characterId, { dungeonLevel });

                socket.emit('printBattle', { field, script, userInfo, userStatus: newStatus });
                whoIsDead[dead]('', userInfo);

                return;
            }
        }, 1500);

        userStatus.cooldown = Date.now()-2000;
        socket.emit('printBattle', { field: 'action', script: '', userInfo, userStatus  });
    },

    // 일반전투 스킬 사용
    actionSkill: async(CMD: string, userInfo: UserInfo, userStatus: UserStatus) => {
        console.log('battle.handler.ts: actionSkill()');
        let tempScript = '';
        let field = 'action';
        const { characterId, attack, mp, skill } = userStatus;

        // 스킬 정보 가져오기
        if (skill[Number(CMD)-1] === undefined) {
            battle.battleHelp(CMD, userInfo);
        }
        const { name: skillName, cost, multiple } = skill[Number(CMD)-1];
        console.log('battle.handler.ts: skill use', skillName);
        
        // 몬스터 정보 가져오기
        const { monsterId } = battleCache.get(characterId);
        const monster = await MonsterService.findByPk(monsterId!);
        if (!monster || !monsterId) throw new Error(`몬스터 정보가 없습니다. ${characterId}`);
        const { name: monsterName, hp: monsterHp, exp: monsterExp } = monster;

        // 마나 잔여량 확인
        if (mp - cost < 0) {
            tempScript += `??? : 비전력이 부조카당.\n`;
            const script = tempScript;
            socket.emit('printBattle', { field, script, userInfo, userStatus });
        }

        // 스킬 데미지 계산
        const playerSkillDamage: number = Math.floor(
            (attack * multiple) / 100,
        );
        const realDamage: number = BattleService.hitStrength(playerSkillDamage);

        // 스킬 Cost 적용
        userStatus = await CharacterService.refreshStatus(characterId, 0, cost, monsterId);

        tempScript += `\n당신의 ${skillName} 스킬이 ${monsterName}에게 적중! => ${realDamage}의 데미지!\n`;

        // 몬스터에게 스킬 데미지 적용 
        const isDead = await MonsterService.refreshStatus(monsterId, realDamage, characterId);
        if (!isDead) throw new Error('몬스터 정보를 찾을 수 없습니다');

        if (isDead === 'dead') {
            console.log('battle.handler.ts: monster dead by skill');
            battleCache.set(characterId, { dead: 'monster' });
            const result = await battle.resultMonsterDead(monster, tempScript);
            socket.emit('printBattle', result);
            return;
        }

        // isDead === 'alive'
        console.log('battle.handler.ts: monster alive from skill');
        const script = tempScript;
        userStatus.cooldown = Date.now();
        socket.emit('printBattle', { field, script, userInfo, userStatus });
    },

    // DEPRECATED
    // (구)자동전투용으로 완전 대체 이후 삭제
    // (구)일반/(구)자동 기본공격에서 사용 중
    autoAttack: async (CMD: string | undefined, userStatus: UserStatus) => {
        let tempScript: string = '';
        let field = 'action';
        const { characterId, attack: playerDamage } = userStatus;

        const { autoAttackTimer, monsterId } = battleCache.get(characterId);
        // const { monsterId } = await redis.hGetAll(characterId);

        // 유저&몬스터 정보 불러오기
        const monster = await Monsters.findByPk(monsterId);

        if (!autoAttackTimer || !monster || !monsterId) {
            return { script: '내부에러', field: 'dungeon', userStatus, error: true }
        }

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
            battleCache.set(characterId, { dead: 'monster' });
            // await redis.hSet(characterId, { dead: 'monster' });
            const { script, field, userStatus } = await battle.resultMonsterDead(monster, tempScript);
            
            return { script, field, userStatus };
        }

        // 몬스터 턴
        console.log('몬스터 턴');
        const monsterHit = BattleService.hitStrength(monsterDamage);
        const monsterAdjective = BattleService.dmageAdjective(
            monsterHit,
            monsterDamage,
        );
        tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;

        userStatus = await CharacterService.refreshStatus(characterId, monsterHit, 0, monsterId);
        if (userStatus.isDead === 'dead') {
            console.log('유저 사망');

            field = 'adventureResult';
            tempScript += '\n!! 치명상 !!\n';
            tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;
            battleCache.set(characterId, { dead: 'player' });
            // await redis.hSet(characterId, { dead: 'player' });
        }

        const script = tempScript;
        return { field, script, userStatus };
    },

    quitBattle: async (CMD: string | undefined, userInfo: UserInfo) => {
        const { characterId } = userInfo;
        const { monsterId } = battleCache.get(characterId);
        let tempScript: string = '';
        const tempLine = '========================================\n';

        tempScript += `당신은 도망쳤습니다. \n`;
        tempScript += `??? : 하남자특. 도망감.\n\n`;
        tempScript += `목록 - 던전 목록을 불러옵니다.\n`;
        tempScript += `입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`;

        // 몬스터 삭제
        MonsterService.destroyMonster(monsterId!, +characterId);

        const script = tempLine + tempScript;
        const field = 'dungeon';

        socket.emit('print', { script, userInfo, field });
    },

    wrongCommand: (CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'battle';
        socket.emit('print', { script, userInfo, field });
    },
};
