import { Characters, Fields, Titles, Users } from '../db/models';
import { MonsterService } from '../services'
import { UserSession } from '../interfaces/user';


class CharacterService {

    /***************************************************************
        모든 필드 JOIN해서 가져옴
    ****************************************************************/
    async findByPk(characterId: number|string): Promise<any> {
        const character: Characters | null = await Characters.findOne({
            where: { characterId: Number(characterId) },
            include: [Users, Fields, Titles],
        });
        if (!character) return null;

        const session = await Characters.getSessionData(character!);

        return {
            ...character.get(),
            ...session,
        };
    }

    async findOneByUserId(userId: number|string) {
        const result =  await Characters.findOne({
            where: { userId: Number(userId) }
        });

        if (!result) {
            return null;
        }
        return result;
    }

    /***************************************************************
        findOne(). userId 혹은 name.
        charactedId 검색은 findByPk()
    ****************************************************************/
    async findOneByName(name: string) {
        const result =  await Characters.findOne({
            where: { name },
            include: [Users, Fields, Titles]
        });

        if (!result) {
            return null;
        }
        return {
            ...result.get(),
            User: result.User.getDataValue('username'),
            Title: result.Title.getDataValue('name'),
            Field: {
                name: result.Field.getDataValue('name'),
                level: result.Field.getDataValue('level'),
            }
        };
    }

    async createNewCharacter({ userId, name }: Partial<Characters>) {
        return await Characters.create({ 
            userId: userId!, 
            titleId: 1,
            fieldId: 1,
            name,
            skill: '1',
            item: '1:2',
        });
    }


    /***************************************************************
        스킬 변경
    ****************************************************************/
    async changeSkill(characterId: number|string, ...skillId: number[]) {
        if ( Array.isArray(skillId) && skillId.length > 3) {
            throw new Error('스킬은 3개까지 등록할 수 있습니다.');
        }
        const skill = skillId.join(':');
        await Characters.update({ skill }, {
            where: { characterId: Number(characterId) }
        });
    }

    /***************************************************************
        장비 변경
    ****************************************************************/
    async changeItem(characterId: number|string, ...itemId: number[]) {
        if ( Array.isArray(itemId) && itemId.length > 2) {
            throw new Error('장비는 2개까지 등록할 수 있습니다.');
        }
        const item = itemId.join(':');
        await Characters.update({ item }, {
            where: { characterId: Number(characterId) }
        });
    }

    /***************************************************************
         전투 턴이 종료되고 hp, mp 상태 갱신
    ****************************************************************/
    async refreshStatus(
        characterId: number|string, damage: number, cost: number, monsterId: number|string
    ): Promise<UserSession> {
        const result = await Characters.findOne({
            where: { characterId: Number(characterId) },
            include: Users,
        });
        // const questId = await QuestCompletes.findOne()
        if (!result) throw new Error('존재하지 않는 캐릭터');

        const { hp, mp } = result.get();
        const newHp = hp - damage;
        const newMp = mp - cost > 0 ? mp - cost : 0;
        
        let isDead = '';
        if (newHp > 0) {
            result.update({ hp: newHp, mp: newMp });
            isDead = 'alive';
        } else {
            MonsterService.destroyMonster(monsterId, characterId);
            isDead = 'dead';
        }

        return {
            ...result.get()!,
            userId: result.User.getDataValue('userId'),
            username: result.User.getDataValue('username'),
            questId: 1,
            hp: newHp,
            mp: newMp,
            isDead,
        };
    }


    /***************************************************************
        전투 종료 경험치&레벨 계산
    ****************************************************************/
    async addExp(characterId: number|string, exp: number): Promise<UserSession> {
        const result = await Characters.findOne({
            where: { characterId: Number(characterId) },
            include: Users,
        });
        if (!result) throw new Error('존재하지 않는 캐릭터');

        const reHp = result.hp + result.maxhp*0.05;
        const reMp = result.hp + result.maxmp*0.2;
        await result.update({ 
            exp: result.exp + exp, 
            hp: result.maxhp > reHp ? reHp : result.maxhp, 
            mp: result.maxmp > reMp ? reMp : result.maxmp, 
        });

        const level = Characters.levelCalc(
            result.get('exp') + exp,
            result.get('level'),
        );
        let levelup = false;
        if (level > result.get('level')) {
            levelup = true;
            await result.update({
                level,
                maxhp: 100 * level,
                maxmp: 100 * level,
                hp: 100 * level,
                mp: 100 * level,
                attack: 10 + level,
                defense: 10 + level,
            });
        }

        // const character = await Characters.getSessionData(result);
        return {
            ...result.get()!,
            userId: result.User.getDataValue('userId')!,
            username: result.User.getDataValue('username')!,
            levelup,
            questId: 1,
            exp: result.get('exp') + exp,
        };
    }

    async deleteCharacter(userId: number, characterId: number) {
        characterId = +characterId;
        return await Characters.destroy({
            where: { userId, characterId }
        });
    }
}


export default new CharacterService();