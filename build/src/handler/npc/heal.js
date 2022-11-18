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
exports.default = {
    healHelp: (CMD, user) => {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '명령어 : \n';
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'heal';
        return { script, user, field };
    },
    healTalk: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        const tempLine = '=======================================================================\n';
        const NpcScript = services_1.NpcService.healTalkScript(user.name);
        const script = tempLine + NpcScript;
        const field = 'heal';
        return { script, user, field };
    }),
    heal: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        let tempScript = '';
        const tempLine = '=======================================================================\n\n';
        // db에서 Character HP/MP 수정
        const actionScript = yield services_1.NpcService.healing(Number(user.characterId));
        tempScript += actionScript;
        tempScript += '1 - 아그네스와 대화합니다.\n';
        tempScript += '2 - 치료를 받습니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        // 유저 스테이터스 업데이트
        user.hp = user.maxhp;
        user.mp = user.maxmp;
        const script = tempLine + tempScript;
        const field = 'heal';
        return { script, user, field };
    }),
    healWrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'heal';
        return { script, user, field };
    },
};
