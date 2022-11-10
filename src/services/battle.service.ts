import { Monsters } from '../db/models';

class BattleService {
    async createNewMonster(dungeonLevel: number) {
        const newMonster = await Monsters.createMonster(dungeonLevel);

        return newMonster;
    }
}

export default new BattleService();
