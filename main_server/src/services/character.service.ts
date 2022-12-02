import { Characters, Fields, Titles, Users } from '../db/models';
import { MonsterService } from '../services';
import { UserCache, UserStatus } from '../interfaces/user';

class CharacterService {
    /***************************************************************
        모든 필드 JOIN해서 가져옴
    ****************************************************************/
    async findByPk(characterId: number | string) {
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

    /***************************************************************
        UserStatus
    ****************************************************************/
    async getUserStatus(
        characterId: number | string,
    ): Promise<UserStatus | null> {

        const character: Characters | null = await Characters.findOne({
            where: { characterId: Number(characterId) },
            include: [Users, Fields, Titles],
        });
        if (!character) return null;

        const session = await Characters.getSessionData(character!);

        return {
            characterId: character.characterId,
            username: character.User.username,
            name: character.name,
            job: character.job,
            level: character.level,
            attack: character.attack,
            defense: character.defense,
            maxhp: character.maxhp,
            maxmp: character.maxmp,
            hp: character.hp,
            mp: character.mp,
            exp: character.exp,
            item: session!.item,
            skill: session!.skill,
        };
    }

    async findOneByUserId(userId: number | string) {
        const result = await Characters.findOne({
            where: { userId: Number(userId) },
        });

        return result;
    }

    /***************************************************************
        findOne(). userId 혹은 name.
        charactedId 검색은 findByPk()
    ****************************************************************/
    async findOneByName(name: string) {
        const result = await Characters.findOne({
            where: { name },
            include: [Users, Fields, Titles],
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
            },
        };
    }

    async createNewCharacter({ userId, name }: Partial<Characters>) {
        return await Characters.create({
            userId: userId!,
            titleId: 1,
            fieldId: 1,
            name,
            skill: '1',
            item: '1:1',
        });
    }

    /***************************************************************
        스킬 변경
    ****************************************************************/
    async changeSkill(characterId: number | string, ...skillId: number[]) {
        if (Array.isArray(skillId) && skillId.length > 3) {
            throw new Error('스킬은 3개까지 등록할 수 있습니다.');
        }
        const skill = skillId.join(':');
        await Characters.update(
            { skill },
            {
                where: { characterId: Number(characterId) },
            },
        );
    }

    /***************************************************************
        장비 변경
    ****************************************************************/
    async changeItem(characterId: number | string, ...itemId: number[]) {
        if (Array.isArray(itemId) && itemId.length > 2) {
            throw new Error('장비는 2개까지 등록할 수 있습니다.');
        }
        const item = itemId.join(':');
        await Characters.update(
            { item },
            {
                where: { characterId: Number(characterId) },
            },
        );
    }

    /***************************************************************
         전투 턴이 종료되고 hp, mp 상태 갱신
    ****************************************************************/
    async refreshStatus(
        characterId: number | string,
        damage: number,
        cost: number,
        monsterId?: number | string,
    ): Promise<UserStatus> {
        const result = await this.getUserStatus(characterId);
        // const questId = await QuestCompletes.findOne()
        if (!result) throw new Error('존재하지 않는 캐릭터');

        const { hp, mp } = result;
        const newHp = hp - damage;
        const newMp = mp - cost > 0 ? mp - cost : 0;

        let isDead = '';
        if (newHp > 0) {
            Characters.update(
                { hp: newHp, mp: newMp },
                {
                    where: { characterId },
                },
            );
            isDead = 'alive';
        } else {
            // MonsterService.destroyMonster(monsterId, characterId);
            isDead = 'dead';
        }

        return {
            ...result,
            hp: newHp,
            mp: newMp,
            isDead,
        };
    }

    /***************************************************************
        전투 종료 경험치&레벨 계산
    ****************************************************************/
    async addExp(
        characterId: number | string,
        exp: number,
    ): Promise<UserStatus> {
        const status = await this.getUserStatus(characterId);
        if (!status) throw new Error('존재하지 않는 캐릭터');

        const reHp = status.hp + (status.maxhp / 20);
        const reMp = status.mp + (status.maxmp / 5);
        Characters.update(
            {
                exp: status.exp + exp,
                hp: status.maxhp > reHp ? reHp : status.maxhp,
                mp: status.maxmp > reMp ? reMp : status.maxmp,
            },
            {
                where: { characterId },
            },
        );

        const level = Characters.levelCalc(status.exp + exp, status.level);
        let levelup = false;
        if (level !== status.level) {
            levelup = true;
            Characters.update(
                {
                    level,
                    maxhp: 100 * level,
                    maxmp: 100 * level,
                    hp: 100 * level,
                    mp: 100 * level,
                    attack: 10 + level,
                    defense: 10 + level,
                },
                {
                    where: { characterId },
                },
            );
        }

        return {
            ...status,
            levelup,
            exp: status.exp + exp,
        };
    }

    async deleteCharacter(userId: number, characterId: number) {
        characterId = +characterId;
        return await Characters.destroy({
            where: { userId, characterId },
        });
    }
}

export default new CharacterService();
