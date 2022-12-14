

export default {
    help: 
    `=======================================================================
    명령어 : 
    [수동] 전투 진행 - 수동 전투를 진행합니다.
    [자동] 전투 진행 - 자동 전투를 진행합니다.
    [돌]아가기 - 이전 단계로 돌아갑니다.\n`,

    battleHelp: (CMD: string) => {
        const script = 
        `\n잘못된 명령입니다.
        현재 입력 : '${CMD}'
        ---전투 중 명령어---
        스킬[1] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.
        스킬[2] 사용 - 2번 슬롯에 장착된 스킬을 사용합니다.
        스킬[3] 사용 - 3번 슬롯에 장착된 스킬을 사용합니다.\n`;
        
        return script
    },

    encounterHelp: 
    `명령어 : 
    [공격] 하기 - 전투를 진행합니다.
    [도망] 가기 - 전투를 포기하고 도망갑니다.
    ---전투 중 명령어---
    [스킬] [num] 사용 - 1번 슬롯에 장착된 스킬을 사용합니다.\n`,

    encounter: (name: string) => {
        const script = 
        `=======================================================================
        너머에 ${name}의 그림자가 보인다\n
        [공격] 하기
        [도망] 가기\n`;
        
        return script
    },

    quit: `========================================
    당신은 도망쳤습니다. 
    ??? : 하남자특. 도망감.\n
    목록 - 던전 목록을 불러옵니다.
    입장 [number] - 선택한 번호의 던전에 입장합니다.\n\n`,

    autoHelp: (CMD: string) => {
        const script = 
        `\n잘못된 명령입니다.
        현재 입력 : '${CMD}'
        ---전투 중 명령어---
        [중단] 하기 - 전투를 중단하고 마을로 돌아갑니다.\n`;
        
        return script
    },
}