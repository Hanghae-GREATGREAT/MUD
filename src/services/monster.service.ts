import { Monsters, Fields } from '../db/models';
import { redis } from '../db/cache';

class MonsterService {

    static async createNewMonster(dungeonLevel: number|string, characterId: number|string) {
        const newMonster = await Monsters.createMonster(+dungeonLevel, +characterId);

        return newMonster;
    }

    static async findByPk(monsterId: number|string) {
        return await Monsters.findByPk(Number(monsterId));
    }

    /***************************************************************
     * 전투 턴이 종료되고 hp, mp 상태 갱신
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
            this.destroyMonster(monsterId, characterId)
            return 'dead'
        }
    }

    /***************************************************************
     * 전투 종료 후 몬스터 테이블 삭제
     ***************************************************************/
    static destroyMonster(monsterId: number|string, characterId: number|string) {
        Monsters.destroy({ where: { monsterId: Number(monsterId) } });
        redis.hDel(String(characterId), 'monsterId');
    }
}

export default MonsterService;