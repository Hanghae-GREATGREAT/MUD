import { Characters, Fields, Titles, Users } from "../db/models";


class CharacterService {

    async findOneByUserId(userId: number) {
        const result =  await Characters.findOne({
            where: { userId }
        });

        if (!result) {
            return null;
        }
        return result;
    }

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
        });
    }

    async changeSkill(characterId: number, ...skillId: number[]) {
        if ( Array.isArray(skillId) && skillId.length > 3) {
            throw new Error('스킬은 3개까지 등록할 수 있습니다.');
        }
        const skill = skillId.join(':');
        await Characters.update({ skill }, {
            where: { characterId }
        });
    }

    async changeItem(characterId: number, ...itemId: number[]) {
        if ( Array.isArray(itemId) && itemId.length > 2) {
            throw new Error('장비는 2개까지 등록할 수 있습니다.');
        }
        const item = itemId.join(':');
        await Characters.update({ item }, {
            where: { characterId }
        });
    }
}


export default new CharacterService();