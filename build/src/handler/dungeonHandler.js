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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dungeonList = void 0;
const dungeon_service_1 = __importDefault(require("../services/dungeon.service"));
const cache_1 = require("../db/cache");
const handler_1 = require("../handler");
const scripts_1 = require("../scripts");
exports.default = {
    help: (CMD, user) => {
        let tempScript = '';
        tempScript += '명령어 : \n';
        tempScript += '목록 - 던전 목록을 불러옵니다.\n';
        tempScript += '입장 (번호) - 던전에 들어갑니다.\n';
        tempScript += '돌아가기 - 이전 단계로 돌아갑니다.\n';
        const script = tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },
    getDungeonList: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('dungeon list.');
        console.timeEnd('AUTOBATTLEEEEEEEEEEEEEEEEEEE');
        const result = yield handler_1.front.checkUser(user);
        if (result) {
            const script = scripts_1.homeScript.loadHome;
            const field = 'front';
            return { script, user, field };
        }
        // 던전 목록 불러오기
        const dungeonList = dungeon_service_1.default.getDungeonList();
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `${user.name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n`;
        tempScript += `${dungeonList}`;
        const script = tempLine + tempScript;
        const field = 'dungeon';
        return { script, user, field, chat: true };
    }),
    getDungeonInfo: (CMD, user) => {
        console.log('dungeonInfo.');
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        let nextField = '';
        // 던전 정보 불러오기
        const dungeonInfo = dungeon_service_1.default.getDungeonInfo(Number(CMD));
        if (!dungeonInfo) {
            tempScript += `입력값을 확인해주세요.\n`;
            tempScript += `현재 입력 : 입장 '${CMD}'\n`;
            tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
            nextField = 'dungeon';
        }
        else {
            tempScript += dungeonInfo;
            tempScript += `1. [수동] 전투 진행\n`;
            tempScript += `2. [자동] 전투 진행\n`;
            tempScript += `3. [돌]아가기\n`;
            // 던전 진행상황 업데이트
            // const dungeonSession = {
            //     dungeonLevel: Number(CMD),
            //     monsterId: 0,
            // };
            const dungeonLevel = CMD;
            const characterId = user.characterId.toString();
            cache_1.redis.hSet(characterId, { dungeonLevel });
            // battleCache.set(user.characterId, { dungeonLevel: +CMD! })
            nextField = 'battle';
        }
        const script = tempLine + tempScript;
        const field = nextField;
        return { script, user, field };
    },
    wrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'dungeon';
        return { script, user, field };
    },
};
function dungeonList(name) {
    // 던전 목록 불러오기
    const dungeonList = dungeon_service_1.default.getDungeonList();
    console.log(dungeonList);
    // 임시 스크립트 선언
    const tempLine = '=======================================================================\n';
    let tempScript = '';
    tempScript += `${name}은(는) 깊은 심연으로 발걸음을 내딛습니다.\n\n`;
    tempScript += `${dungeonList}`;
    return tempLine + tempScript;
}
exports.dungeonList = dungeonList;
