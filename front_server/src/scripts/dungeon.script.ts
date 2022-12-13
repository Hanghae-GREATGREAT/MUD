export default {
    help: `명령어 : 
    [L]ist - 던전 목록을 불러옵니다.
    [E]nter [num] - 던전에 들어갑니다.
    [B]ack - 이전 단계로 돌아갑니다.
    글로벌 명령어 : g [OPTION]\n\n`,
    wrong: (CMD: string) => {
        const script = `=======================================================================
        입력값을 확인해주세요.
        현재 입력 : 입장 '${CMD}'
        [H]elp : 도움말\n\n`;
        return script;
    },
    enter: `1. [수동] 전투 진행
    2. [자동] 전투 진행
    3. [돌]아가기`,
};
