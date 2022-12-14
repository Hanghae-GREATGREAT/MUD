export default {
    help: `명령어 : 
    <span style="color:yellow">[L]ist</span> - 던전 목록을 불러옵니다.
    <span style="color:yellow">[E]nter [num]</span> - 던전에 들어갑니다.
    글로벌 명령어 : <span style="color:yellow">g [OPTION]</span>\n\n`,
    wrong: (CMD: string) => {
        const script = `=======================================================================
        입력값을 확인해주세요.
        현재 입력 : <span style="color:yellow">'${CMD}'</span>
        <span style="color:yellow">[H]elp</span> : 도움말\n\n`;
        return script;
    },
    enter: `1. <span style="color:yellow">[N]ormal</span> - 수동 전투 진행
    2. <span style="color:yellow">[A]uto</span> - 자동 전투 진행
    3. <span style="color:yellow">[B]ack</span> - 돌아가기\n`,
    entrance: `=======================================================================\n\n
    당신은 깊은 심연으로 발걸음을 내딛습니다.\n\n
    입장명령: <span style="color:yellow">[E]nter [num]</span>  ex)'e 1'
    <span style="color:yellow">1</span>. 알비 던전(Lv. 0~9)\n\n
    <span style="color:yellow">2</span>. 라비 던전(Lv. 10~19)\n\n
    <span style="color:yellow">3</span>. 칼페온 신전(Lv. 20~29)\n\n
    <span style="color:yellow">4</span>. 마왕성 주변(Lv. 30~39)\n\n
    <span style="color:yellow">5</span>. 마왕성(Lv. 40~50)\n\n
    `,
};
