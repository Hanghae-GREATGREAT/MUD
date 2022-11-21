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
const services_1 = require("../../services");
const cache_1 = require("../../db/cache");
const socket_routes_1 = require("../../socket.routes");
const __1 = require("..");
exports.default = {
    adventureload: (CMD, userCache) => {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '\n---YOU DIE---\n\n';
        tempScript += '당신은 죽었습니다.\n';
        tempScript += '[마을] - 마을로 돌아가기\n\n';
        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    },
    adventureHelp: (CMD, userCache) => {
        let tempScript = '';
        tempScript += '명령어 : \n';
        // tempScript += '[확인] - 이번 모험의 결과를 확인 합니다.\n';
        tempScript += '[마을] - 마을로 돌아갑니다.\n';
        const script = tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    },
    autoResultMonsterDead: (userCache, script) => __awaiter(void 0, void 0, void 0, function* () {
        const { characterId } = userCache;
        console.log('battleCache, after DEAD', cache_1.battleCache.get(characterId));
        console.log(characterId);
        const { monsterId, dungeonLevel } = cache_1.battleCache.get(characterId);
        const monster = yield services_1.MonsterService.findByPk(monsterId);
        if (!monster) {
            throw new Error('battle.handler.ts >> autoResultMonsterDead() >> 몬스터 데이터X');
        }
        const { name, exp } = monster;
        const newUser = yield services_1.CharacterService.addExp(characterId, exp);
        script += `\n${name} 은(는) 쓰러졌다 ! => Exp + ${exp}\n`;
        if (userCache.levelup) {
            script += `\n==!! LEVEL UP !! 레벨이 ${userCache.level - 1} => ${userCache.level} 올랐습니다 !! LEVEL UP !!==\n\n`;
        }
        const result = { script, userCache: newUser, field: 'autoBattle' };
        socket_routes_1.socket.emit('print', result);
        cache_1.battleCache.delete(characterId);
        yield services_1.MonsterService.destroyMonster(monsterId, characterId);
        cache_1.battleCache.set(characterId, { dungeonLevel });
        __1.battle.autoBattleW('', newUser);
        return;
    }),
    autoResultPlayerDead: (userCache, script) => __awaiter(void 0, void 0, void 0, function* () {
        const { script: newScript, field, userCache: newUser } = __1.village.healInfo('', userCache);
        // field: dungeon , chat: true
        const result = { script: script + newScript, userCache: newUser, field };
        socket_routes_1.socket.emit('print', result);
        const { characterId } = userCache;
        const { monsterId } = cache_1.battleCache.get(characterId);
        cache_1.battleCache.delete(characterId);
        yield services_1.MonsterService.destroyMonster(monsterId, characterId);
        return;
    }),
    getDetail: (CMD, userCache) => __awaiter(void 0, void 0, void 0, function* () {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        const script = tempLine + tempScript;
        const field = 'adventureResult';
        return { script, userCache, field };
    }),
    returnVillage: (CMD, userCache) => __awaiter(void 0, void 0, void 0, function* () {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '미구현 - 일단 던전으로 이동됨\n';
        tempScript += '[목록] - 던전 목록 불러오기\n';
        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, userCache, field };
    }),
    adventureWrongCommand: (CMD, userCache) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, userCache, field };
    },
};
