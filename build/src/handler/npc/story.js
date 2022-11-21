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
    // help: (CMD: string | undefined, user: UserSession) => {}
    storyHelp: (CMD, userCache) => {
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        tempScript += '명령어 : \n';
        tempScript += '1 - 프라데이리와 대화합니다.\n';
        tempScript += '2 - 모험의 서를 통해 지금까지의 모험록을 확인합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'story';
        return { script, userCache, field };
    },
    storyTalk: (CMD, userCache) => __awaiter(void 0, void 0, void 0, function* () {
        const tempLine = '=======================================================================\n';
        const NpcScript = services_1.NpcService.storyTalkScript(userCache.name);
        const script = tempLine + NpcScript;
        const field = 'story';
        return { script, userCache, field };
    }),
    diary: (CMD, userCache) => __awaiter(void 0, void 0, void 0, function* () {
        // 임시 스크립트 선언
        let tempScript = '';
        const tempLine = '=======================================================================\n';
        // 모험록 스크립트 작성
        const storyScript = services_1.NpcService.story(userCache.name, userCache.level);
        tempScript += storyScript;
        tempScript += '1 - 프라데이리와 대화합니다.\n';
        tempScript += '2 - 모험의 서를 통해 지금까지의 모험록을 확인합니다.\n';
        tempScript += '3 - 이전 단계로 돌아갑니다.\n';
        const script = tempLine + tempScript;
        const field = 'story';
        return { script, userCache, field };
    }),
    storyWrongCommand: (CMD, userCache) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'story';
        return { script, userCache, field };
    },
};
