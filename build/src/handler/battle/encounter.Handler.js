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
class EncounterHandler {
    constructor() {
        // help: (CMD: string | undefined, user: UserSession) => {}
        this.ehelp = (CMD, userCache) => {
            let tempScript = '';
            tempScript += '명령어 : \n';
            tempScript += '[공격] 하기 - 전투를 진행합니다.\n';
            tempScript += '[도망] 가기 - 전투를 포기하고 도망갑니다.\n';
            tempScript += '---전투 중 명령어---\n';
            tempScript +=
                '[스킬] [num] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n';
            const script = tempScript;
            const field = 'encounter';
            return { script, userCache, field };
        };
        this.encounter = (CMD, userCache) => __awaiter(this, void 0, void 0, function* () {
            // 던전 진행상황 불러오기
            const { characterId } = userCache;
            // const { dungeonLevel } = await redis.hGetAll(characterId);
            const { dungeonLevel } = cache_1.battleCache.get(characterId);
            let tempScript = '';
            const tempLine = '=======================================================================\n';
            // 적 생성
            const { name, monsterId } = yield services_1.MonsterService.createNewMonster(dungeonLevel, characterId);
            tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
            tempScript += `[공격] 하기\n`;
            tempScript += `[도망] 가기\n`;
            // 던전 진행상황 업데이트
            // await redis.hSet(characterId, { monsterId });
            cache_1.battleCache.set(characterId, { monsterId });
            const script = tempLine + tempScript;
            const field = 'encounter';
            return { script, userCache, field };
        });
        this.reEncounter = (CMD, userCache) => __awaiter(this, void 0, void 0, function* () {
            // 던전 진행상황 불러오기
            const { characterId } = userCache;
            // const { dungeonLevel } = await redis.hGetAll(characterId);
            const { dungeonLevel } = cache_1.battleCache.get(characterId);
            let tempScript = '';
            const tempLine = '=======================================================================\n';
            // 적 생성
            const { name, monsterId } = yield services_1.MonsterService.createNewMonster(dungeonLevel, characterId);
            tempScript += `너머에 ${name}의 그림자가 보인다\n\n`;
            tempScript += `[공격] 하기\n`;
            tempScript += `[도망] 가기\n`;
            // 던전 진행상황 업데이트
            cache_1.battleCache.set(characterId, { monsterId });
            const script = tempLine + tempScript;
            const field = 'encounter';
            userCache = yield services_1.CharacterService.addExp(characterId, 0);
            return { script, userCache, field };
        });
        this.ewrongCommand = (CMD, userCache) => {
            let tempScript = '';
            tempScript += `입력값을 확인해주세요.\n`;
            tempScript += `현재 입력 : '${CMD}'\n`;
            tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
            const script = 'Error : \n' + tempScript;
            const field = 'encounter';
            return { script, userCache, field };
        };
    }
}
;
exports.default = new EncounterHandler();
