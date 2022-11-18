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
exports.NpcList = void 0;
const handler_1 = require("../handler");
const scripts_1 = require("../scripts");
exports.default = {
    villagehelp: (CMD, user) => {
        let tempScript = '';
        tempScript += '명령어 : \n';
        tempScript += '목록 - NPC 목록을 불러옵니다.\n';
        tempScript += '[번호] - 번호에 해당하는 NPC를 방문합니다.\n';
        tempScript += 'OUT - 로그아웃 합니다.\n';
        const script = tempScript;
        const field = 'village';
        return { script, user, field };
    },
    NpcList: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('NPC list.');
        // 유저 인증정보 확인
        const result = yield handler_1.front.checkUser(user);
        if (result) {
            const script = scripts_1.homeScript.loadHome;
            const field = 'front';
            return { script, user, field };
        }
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `1. 프라데이리 - 모험의 서\n\n`;
        tempScript += `2. 아그네스 - 힐러의 집\n\n`;
        tempScript += `3. 퍼거스 - 대장장이\n\n`;
        tempScript += `4. 에트나 - 제비뽑기\n\n`;
        const script = tempLine + tempScript;
        const field = 'village';
        return { script, user, field, chat: true };
    }),
    storyInfo: (CMD, user) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `프라데이리\n\n`;
        tempScript += `문양이 있는 검은색의 드레스를 입은 아름다운 소녀.\n바다를 연상시키는 파란 눈동자는 빨려들어갈 것 같은 신비한 아름다움이 느껴진다.\n맑고 깨끗한 피부와 마치 인형 같이 예쁜 몸매는, 어딘지 현실의 사람이 아닌 것 같은 위화감이\n있다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 모험의 서\n`;
        tempScript += `3 - 돌아가기\n`;
        const script = tempLine + tempScript;
        const field = 'story';
        return { script, user, field };
    },
    healInfo: (CMD, user) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `아그네스\n\n`;
        tempScript += `백옥같이 하얀 얼굴에서 순수함을 가득 머금은 까만 눈동자가 빛난다.\n차분한 느낌을 주는 진녹색 머리카락을 양 갈래로 단정히 묶은 그녀는 흰색과 연두색이 적당히 섞인 힐러드레스를 맵시 있게 차려입었다.\n인기척을 느낀 그녀가 두 손을 앞에 모은 뒤 살짝 미소짓는 얼굴로 이쪽을 바라본다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 치료받기\n`;
        tempScript += `3 - 돌아가기\n`;
        const script = tempLine + tempScript;
        const field = 'heal';
        return { script, user, field };
    },
    enhanceInfo: (CMD, user) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `퍼거스\n\n`;
        tempScript += `연륜이 느껴지는 윤곽이 뚜렷한 얼굴에 그리 길지 않게 기른 검은 수염, 그리고 잘 그을린 구릿빛\n피부가 인상적인 남자다.\n뭔가 굵고 낮은 곡조로 콧노래를 흥얼거리고 있는데, 하체에 비해 상체가 잘 발달된 그의 몸은\n그가 흥얼거리는 노래의 박자에 맞춰 기분좋게 천천히 흔들거리고 있다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 강화하기\n`;
        tempScript += `3 - 돌아가기\n`;
        const script = tempLine + tempScript;
        const field = 'enhance';
        return { script, user, field };
    },
    gambleInfo: (CMD, user) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript = '';
        tempScript += `에트나\n\n`;
        tempScript += `제라늄 꽃잎 같이 밝은 머리칼은 곤충의 더듬이처럼 빳빳하게 말려있고 가벼운 움직임에도\n흔들리는 네커치프는 여린 목을 조이듯 휘감는다.\n말굽을 코밑에 매달아 놓은 것 같은 표정으로 성큼성큼 다가온 그녀는 걸어오는 싸움이라면\n마다하지 않겠다는 도전적인 눈빛으로 상대를 바라본다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 제비뽑기\n`;
        tempScript += `3 - 돌아가기\n`;
        const script = tempLine + tempScript;
        const field = 'gamble';
        return { script, user, field };
    },
    villageWrongCommand: (CMD, user) => {
        let tempScript = '';
        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `사용가능한 명령어가 궁금하시다면 '도움말'을 입력해보세요.\n`;
        const script = 'Error : \n' + tempScript;
        const field = 'village';
        return { script, user, field };
    },
};
function NpcList(name) {
    // 임시 스크립트 선언
    const tempLine = '=======================================================================\n';
    let tempScript = '';
    tempScript += `${name}은(는) 멀리 보이는 굴뚝 연기를 향해 발걸음을 내딛습니다.\n\n`;
    tempScript += `방문할 NPC의 번호를 입력해주세요.\n\n`;
    tempScript += `1. 프라데이리 - 모험의 서\n\n`;
    tempScript += `2. 아그네스 - 힐러의 집\n\n`;
    tempScript += `3. 퍼거스 - 대장장이\n\n`;
    tempScript += `4. 에트나 - ???\n\n`;
    return tempLine + tempScript;
}
exports.NpcList = NpcList;
