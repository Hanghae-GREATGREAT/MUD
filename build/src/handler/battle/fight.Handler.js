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
exports.default = {
    // help: (CMD: string | undefined, user: UserSession) => {}
    battleHelp: (CMD, user) => {
        let tempScript = '';
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
        return { script, user, field };
    },
    autoBattleHelp: (CMD, user) => {
        let tempScript = '';
        // tempScript += '\n명령어 : \n';
        // tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
        tempScript += `\n잘못된 명령입니다.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += '---전투 중 명령어---\n';
        tempScript += '[중단] 하기 - 전투를 중단하고 마을로 돌아갑니다.\n';
        const script = tempScript;
        const field = 'action';
        return { script, user, field };
    },
    quitBattle: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        const characterId = user.characterId.toString();
        const { monsterId } = yield cache_1.redis.hGetAll(characterId);
        // const { monsterId } = battleCache.get(characterId);
        let tempScript = '';
        const tempLine = '========================================\n';
        tempScript += `당신은 도망쳤습니다. \n\n`;
        tempScript += `??? : 하남자특. 도망감.\n`;
        // 몬스터 삭제
        services_1.MonsterService.destroyMonster(+monsterId, +characterId);
        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    }),
    quitAutoBattle: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        const characterId = user.characterId.toString();
        const { monsterId } = yield cache_1.redis.hGetAll(characterId);
        let tempScript = '';
        const tempLine = '========================================\n';
        tempScript += `전투를 중단하고 마을로 돌아갑니다. \n\n`;
        // 기본공격 중단 & 몬스터 삭제
        const { autoAttackId } = cache_1.battleCache.get(characterId);
        clearInterval(autoAttackId);
        cache_1.battleCache.delete(characterId);
        cache_1.redis.hDelBattleCache(characterId);
        services_1.MonsterService.destroyMonster(+monsterId, +characterId);
        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    }),
    fwrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'encounter';
        return { script, user, field };
    },
};
