import { battleCache } from "../db/cache";
import { UserStatus } from "../interfaces/user";
import { AutoWorkerResult } from "../interfaces/worker";
import BATTLE from "../redis";
import { CharacterService, MonsterService, BattleService } from "../services";


async function autoAttack(socketId: string, userStatus: UserStatus): Promise<AutoWorkerResult> {
    const { characterId, attack: playerDamage } = userStatus;
    // console.log('autoAttack.worker.ts: 50 >> autoAttack() 시작', characterId);

    let tempScript = '';
    const { autoAttackTimer, monsterId } = battleCache.get(characterId);
    if (!autoAttackTimer! || !monsterId) {
        return { status: 'error', script: '몬스터 정보 에러', userStatus };
    }

    // 몬스터 정보 불러오기
    // console.log('autoAttack.worker.ts: 몬스터 정보, ', characterId);
    const monster = await MonsterService.findByPk(monsterId);
    if (!monster) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    const { name: monsterName, hp: monsterHP, attack: monsterDamage, exp: monsterExp } = monster;

    // 유저 턴
    // console.log('autoAttack.worker.ts: 66 >> 플레이어 턴, ', characterId);
    const playerHit = BattleService.hitStrength(playerDamage);
    const playerAdjective = BattleService.dmageAdjective(
        playerHit,
        playerDamage,
    );
    tempScript += `\n당신의 ${playerAdjective} 공격이 ${monsterName}에게 적중했다. => ${playerHit}의 데미지!\n`;
    // console.log(tempScript);
    
    const isDead = await MonsterService.refreshStatus(monsterId, playerHit, characterId);
    if (!isDead) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    
    if (isDead === 'dead') {
        battleCache.set(characterId, { dead: 'monster' });

        // const data = { field: 'autoBattle', script: tempScript, userStatus };
        // BATTLE.to(socketId).emit('printBattle', data);

        return { status: 'monster', script: tempScript, userStatus };
    }

    if (!monster) return { status: 'error', script: '몬스터 정보 에러', userStatus };
    // 몬스터 턴
    // console.log('autoAttack.worker.ts: 몬스터 턴, ', characterId);
    const monsterHit = BattleService.hitStrength(monsterDamage);
    const monsterAdjective = BattleService.dmageAdjective(
        monsterHit,
        monsterDamage,
    );
    tempScript += `${monsterName} 이(가) 당신에게 ${monsterAdjective} 공격! => ${monsterHit}의 데미지!\n`;
    // console.log(tempScript);
    
    userStatus = await CharacterService.refreshStatus(userStatus, monsterHit, 0, monsterId);
    if (userStatus.isDead === 'dead') {
        battleCache.set(characterId, { dead: 'player' });
        
        tempScript += '\n!! 치명상 !!\n';
        tempScript += `당신은 ${monsterName}의 공격을 버티지 못했습니다.. \n`;        
        tempScript += `${monsterName} 의 ${monsterAdjective} 공격이 치명상으로 적중! => ${monsterHit}의 데미지!
        마을로 돌아갑니다...!!\n`;

        // const data = { field: 'autoBattle', script: tempScript, userStatus: refreshUser };
        // BATTLE.to(socketId).emit('printBattle', data);

        return { status: 'player', script: tempScript, userStatus };
    }

    const data = { field: 'autoBattle', script: tempScript, userStatus };
    BATTLE.to(socketId).emit('printBattle', data);

    return { status: 'continue', script: tempScript, userStatus };
}


export default autoAttack;