import { Monsters, Fields } from '../db/models';
import { battleCache, redis } from '../db/cache';

class MonsterService {

    static async createNewMonster(dungeonLevel: number|string, characterId: number|string) {
        console.log('monster.service.ts >> createNewMonster() 몬스터 생성')
        const newMonster = await Monsters.createMonster(+dungeonLevel, +characterId);

        return newMonster;
    }

    static async findByPk(monsterId: number|string) {
        return await Monsters.findByPk(Number(monsterId));
    }

    /***************************************************************
        전투 턴이 종료되고 hp, mp 상태 갱신
        몬스터 사망
     ***************************************************************/
    static refreshStatus = async(
        monsterId: number|string, damage: number, characterId: number|string
    ) => {
        
        const result = await Monsters.findByPk(Number(monsterId), {
            include: [Fields],
        });
        if (!result) return null;

        const { hp } = result.get();
        const newHp = hp - damage;

        if (newHp > 0) {
            result.update({ hp: newHp });
            return 'alive'
        } else {
            // this.destroyMonster(monsterId, characterId)
            return 'dead'
        }
    }

    /***************************************************************
     * 전투 종료 후 몬스터 테이블 삭제
     ***************************************************************/
    static async destroyMonster(monsterId: number|string, characterId: number|string) {
        console.log(`monster.service.ts: 45 >> 몬스터 삭제, ${monsterId}`);
        await Monsters.destroy({ where: { monsterId: Number(monsterId) } });
        // redis.hDel(String(characterId), 'monsterId');
        // 여기서 지우나?
        // battleCache.delete(characterId);
    }
}

export default MonsterService;