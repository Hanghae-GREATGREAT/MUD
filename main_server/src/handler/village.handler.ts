import { Socket } from 'socket.io';
import { front } from '../handler';
import { homeScript } from '../scripts';
import { UserInfo } from '../interfaces/user';

export default {
    villagehelp: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript = '';

        tempScript += '명령어 : \n';
        tempScript += '[L]ist - NPC 목록을 불러옵니다.\n';
        tempScript += '[번호] - 번호에 해당하는 NPC를 방문합니다.\n';
        tempScript += '글로벌 명령어 : g [OPTION]\n';

        const script = tempScript;
        const field = 'village';

        socket.emit('print', { script, userInfo, field });
    },

    NpcList: async (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        console.log('NPC list.');
        // 유저 인증정보 확인
        const result = await front.checkUser(userInfo);
        if (result) {
            const script = homeScript.loadHome;
            const field = 'front';
            socket.emit('print', { field, script, userInfo });
        }
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `1. 프라데이리 - 모험의 서\n\n`;
        tempScript += `2. 아그네스 - 힐러의 집\n\n`;
        tempScript += `3. 퍼거스 - 대장장이\n\n`;
        tempScript += `4. 에트나 - 제비뽑기\n\n`;
        tempScript += `5. 샤크스 경 - 시련의 장 관리인\n\n`;

        const script = tempLine + tempScript;
        const field = 'village';

        socket.emit('print', { field, script, userInfo, chat: true });
    },

    storyInfo: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `프라데이리\n\n`;
        tempScript += `문양이 있는 검은색의 드레스를 입은 아름다운 소녀.\n바다를 연상시키는 파란 눈동자는 빨려들어갈 것 같은 신비함이 느껴진다.\n맑고 깨끗한 피부와 마치 인형 같이 예쁜 몸매는, 어딘지 현실의 사람이 아닌 것 같은 위화감이 있다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 모험의 서\n`;
        tempScript += `3 - 돌아가기\n`;

        const script = tempLine + tempScript;
        const field = 'story';

        socket.emit('print', { script, userInfo, field });
    },

    healInfo: (socket: Socket) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `아그네스\n\n`;
        tempScript += `백옥같이 하얀 얼굴에서 순수함을 가득 머금은 까만 눈동자가 빛난다.\n차분한 느낌을 주는 진녹색 머리카락을 양 갈래로 단정히 묶은 그녀는,\n흰색과 연두색이 적당히 섞인 힐러드레스를 맵시 있게 차려입었다.\n인기척을 느낀 그녀가 두 손을 앞에 모은 뒤 살짝 미소지은 채 이쪽을 바라본다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 치료받기\n`;
        tempScript += `3 - 돌아가기\n`;

        const script = tempLine + tempScript;
        const field = 'heal';

        socket.emit('print', { script, field });
    },

    enhanceInfo: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `퍼거스\n\n`;
        tempScript += `연륜이 느껴지는 윤곽이 뚜렷한 얼굴에 그리 길지 않게 기른 검은 수염,\n그리고 잘 그을린 구릿빛 피부가 인상적인 남자다.\n뭔가 굵고 낮은 곡조로 콧노래를 흥얼거리고 있는데, 하체에 비해 상체가 잘 발달된 그의 몸은\n그가 흥얼거리는 노래에 맞춰 기분좋게 흔들거리고 있다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 강화하기 (주의!! 경험치를 소모합니다!!)\n`;
        tempScript += `3 - 돌아가기\n`;

        const script = tempLine + tempScript;
        const field = 'enhance';

        socket.emit('print', { script, userInfo, field });
    },

    gambleInfo: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        // 임시 스크립트 선언
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `에트나\n\n`;
        tempScript += `제라늄 꽃잎처럼 밝은 머리칼은 빳빳하게 말려있고 가벼운 움직임에도\n흔들리는 네커치프는 여린 목을 조이듯 휘감는다.\n말굽을 코밑에 매달아 놓은 것 같은 표정으로 성큼성큼 다가온 그녀는\n걸어오는 싸움이라면 마다하지 않겠다는 도전적인 눈빛으로 상대를 바라본다.\n\n`;
        tempScript += `1 - 대화하기\n`;
        tempScript += `2 - 제비뽑기\n`;
        tempScript += `3 - 돌아가기\n`;

        const script = tempLine + tempScript;
        const field = 'gamble';

        socket.emit('print', { script, userInfo, field });
    },

    pvpInfo: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        const tempLine = '=======================================================================\n';
        let tempScript: string = '';

        tempScript += `샤크스 경\n\n`;
        tempScript += `잘 단련된 몸에 가죽을 덧대 만들었음직한 갑옷을 보기 좋게 걸치고, 허리에는\n적당한 길이의 칼을 찬 이 남자.\n머리에 쓴 투구가 코까지 가리고 있어 얼굴을 볼 수는 없지만, 헬멧의 슬릿 사이로 때때로 강렬한 눈빛이 비치는 것만 같다.\n\n`;
        tempScript += `1. 대화하기\n`;
        tempScript += `2. 입장하기\n`;
        tempScript += `3. 돌아가기\n\n`;

        const script = tempLine + tempScript;
        const field = 'pvpNpc';

        socket.emit('print', { script, userInfo, field });
    },

    villageWrongCommand: (socket: Socket, CMD: string | undefined, userInfo: UserInfo) => {
        let tempScript: string = '';

        tempScript += `입력값을 확인해주세요.\n`;
        tempScript += `현재 입력 : '${CMD}'\n`;
        tempScript += `도움말 : [H]elp\n`;

        const script = 'Error : \n' + tempScript;
        const field = 'village';

        socket.emit('print', { script, userInfo, field });
    },
};

export function NpcList(name: string) {
    // 임시 스크립트 선언
    const tempLine = '=======================================================================\n';
    let tempScript: string = '';

    tempScript += `${name}은(는) 멀리 보이는 굴뚝 연기를 향해 발걸음을 내딛습니다.\n\n`;
    tempScript += `방문할 NPC의 번호를 입력해주세요.\n\n`;
    tempScript += `1. 프라데이리 - 모험의 서\n\n`;
    tempScript += `2. 아그네스 - 힐러의 집\n\n`;
    tempScript += `3. 퍼거스 - 대장장이\n\n`;
    tempScript += `4. 에트나 - 제비뽑기\n\n`;
    tempScript += `5. 샤크스 경 - 시련의 장 관리인\n\n`;

    return tempLine + tempScript;
}
