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
    enhanceHelp: (CMD, user) => {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '명령어 : \n';
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'enhance';
        return { script, user, field };
    },
    enhanceTalk: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        const tempLine = '=======================================================================\n';
        const NpcScript = services_1.NpcService.enhanceTalkScript(user.name);
        const script = tempLine + NpcScript;
        const field = 'enhance';
        return { script, user, field };
    }),
    enhance: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        const actionScript = yield services_1.NpcService.enhance(Number(user.characterId));
        tempScript += actionScript;
        tempScript += '1 - 퍼거스와 대화합니다.\n';
        tempScript += '2 - 장비를 강화 합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'enhance';
        return { script, user, field };
    }),
    enhanceWrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'enhance';
        return { script, user, field };
    },
};
