"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../db/models");
const services_1 = require("../services");
class CharacterService {
    /***************************************************************
        모든 필드 JOIN해서 가져옴
    ****************************************************************/
    findByPk(characterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const character = yield models_1.Characters.findOne({
                where: { characterId: Number(characterId) },
                include: [models_1.Users, models_1.Fields, models_1.Titles],
            });
            if (!character)
                return null;
            const session = yield models_1.Characters.getSessionData(character);
            return Object.assign(Object.assign({}, character.get()), session);
        });
    }
    findOneByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield models_1.Characters.findOne({
                where: { userId: Number(userId) }
            });
            if (!result) {
                return null;
            }
            return result;
        });
    }
    /***************************************************************
        findOne(). userId 혹은 name.
        charactedId 검색은 findByPk()
    ****************************************************************/
    findOneByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield models_1.Characters.findOne({
                where: { name },
                include: [models_1.Users, models_1.Fields, models_1.Titles]
            });
            if (!result) {
                return null;
            }
            return Object.assign(Object.assign({}, result.get()), { User: result.User.getDataValue('username'), Title: result.Title.getDataValue('name'), Field: {
                    name: result.Field.getDataValue('name'),
                    level: result.Field.getDataValue('level'),
                } });
        });
    }
    createNewCharacter({ userId, name }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield models_1.Characters.create({
                userId: userId,
                titleId: 1,
                fieldId: 1,
                name,
                skill: '1',
                item: '1:2',
            });
        });
    }
    /***************************************************************
        스킬 변경
    ****************************************************************/
    changeSkill(characterId, ...skillId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(skillId) && skillId.length > 3) {
                throw new Error('스킬은 3개까지 등록할 수 있습니다.');
            }
            const skill = skillId.join(':');
            yield models_1.Characters.update({ skill }, {
                where: { characterId: Number(characterId) }
            });
        });
    }
    /***************************************************************
        장비 변경
    ****************************************************************/
    changeItem(characterId, ...itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(itemId) && itemId.length > 2) {
                throw new Error('장비는 2개까지 등록할 수 있습니다.');
            }
            const item = itemId.join(':');
            yield models_1.Characters.update({ item }, {
                where: { characterId: Number(characterId) }
            });
        });
    }
    /***************************************************************
         전투 턴이 종료되고 hp, mp 상태 갱신
    ****************************************************************/
    refreshStatus(characterId, damage, cost, monsterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield models_1.Characters.findOne({
                where: { characterId: Number(characterId) },
                include: models_1.Users,
            });
            // const questId = await QuestCompletes.findOne()
            if (!result)
                throw new Error('존재하지 않는 캐릭터');
            const { hp, mp } = result.get();
            const newHp = hp - damage;
            const newMp = mp - cost > 0 ? mp - cost : 0;
            let isDead = '';
            if (newHp > 0) {
                result.update({ hp: newHp, mp: newMp });
                isDead = 'alive';
            }
            else {
                services_1.MonsterService.destroyMonster(monsterId, characterId);
                isDead = 'dead';
            }
            return Object.assign(Object.assign({}, result.get()), { userId: result.User.getDataValue('userId'), username: result.User.getDataValue('username'), questId: 1, hp: newHp, mp: newMp, isDead });
        });
    }
    /***************************************************************
        전투 종료 경험치&레벨 계산
    ****************************************************************/
    addExp(characterId, exp) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield models_1.Characters.findOne({
                where: { characterId: Number(characterId) },
                include: models_1.Users,
            });
            if (!result)
                throw new Error('존재하지 않는 캐릭터');
            const reHp = result.hp + result.maxhp * 0.05;
            const reMp = result.hp + result.maxmp * 0.2;
            yield result.update({
                exp: result.exp + exp,
                hp: result.maxhp > reHp ? reHp : result.maxhp,
                mp: result.maxmp > reMp ? reMp : result.maxmp,
            });
            const level = models_1.Characters.levelCalc(result.get('exp') + exp, result.get('level'));
            let levelup = false;
            if (level > result.get('level')) {
                levelup = true;
                yield result.update({
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
            return Object.assign(Object.assign({}, result.get()), { userId: result.User.getDataValue('userId'), username: result.User.getDataValue('username'), levelup, questId: 1, exp: result.get('exp') + exp });
        });
    }
    deleteCharacter(userId, characterId) {
        return __awaiter(this, void 0, void 0, function* () {
            characterId = +characterId;
            return yield models_1.Characters.destroy({
                where: { userId, characterId }
            });
        });
    }
}
exports.default = new CharacterService();
