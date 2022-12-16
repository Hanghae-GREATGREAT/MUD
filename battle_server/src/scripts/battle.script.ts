import { UserStatus } from "../interfaces/user";

export default {
    help: `=======================================================================
    명령어 : 
    <span style="color:yellow">[N]ormal</span>- 수동 전투를 진행합니다.
    <span style="color:yellow">[A]uto</span>- 자동 전투를 진행합니다.
    <span style="color:yellow">[B]ack</span>- 이전 단계로 돌아갑니다.\n`,

    battleHelp: (CMD: string, userStatus: UserStatus) => {
        const skill1 = userStatus.skill[0]?.name;
        const skill2 = userStatus.skill[1]?.name;
        const skill3 = userStatus.skill[2]?.name;

        const s1 = skill1 !== undefined ? `${skill1}을 사용합니다` : '1번 스킬이 비었습니다.';
        const s2 = skill2 !== undefined ? `${skill2}을 사용합니다` : '2번 스킬이 비었습니다.';
        const s3 = skill3 !== undefined ? `${skill3}을 사용합니다` : '3번 스킬이 비었습니다.';

        const script = `\n잘못된 명령입니다.
        현재 입력 : '${CMD}'
        ---전투 중 명령어---
        <span style="color:yellow">[1]</span> - ${s1}
        <span style="color:yellow">[2]</span> - ${s2}
        <span style="color:yellow">[3]</span> - ${s3}\n`;

        return script;
    },

    encounterHelp: `명령어 : 
    <span style="color:yellow">[A]ttack</span> - 전투를 진행합니다.
    <span style="color:yellow">[R]un</span> - 전투를 포기하고 도망갑니다.
    ---전투 중 명령어---
    <span style="color:yellow">[num]</span>- num 슬롯에 장착된 스킬을 사용합니다. 예시. 1\n`,

    encounter: (name: string) => {
        const script = `=======================================================================
        너머에 ${name}의 그림자가 보인다\n
        <span style="color:yellow">[A]ttack</span> - 전투를 진행합니다.
        <span style="color:yellow">[R]un</span> - 전투를 포기하고 도망갑니다.\n`;

        return script;
    },

    quit: `========================================
    당신은 도망쳤습니다. 
    ??? : 하남자특. 도망감.\n
    <span style="color:yellow">[L]ist</span> - 던전 목록을 불러옵니다.
    <span style="color:yellow">[E]nter [num]</span> - 선택한 번호의 던전에 입장합니다.\n\n`,

    autoHelp: (CMD: string) => {
        const script = `\n잘못된 명령입니다.
        현재 입력 : '${CMD}'
        ---전투 중 명령어---
        <span style="color:yellow">[S]top</span> - 전투를 중단하고 마을로 돌아갑니다.\n`;

        return script;
    },

    heal: `아그네스\n
    백옥같이 하얀 얼굴에서 순수함을 가득 머금은 까만 눈동자가 빛난다.
    차분한 느낌을 주는 진녹색 머리카락을 양 갈래로 단정히 묶은 그녀는 흰색과 연두색이 적당히 섞인 힐러드레스를 맵시 있게 차려입었다.
    인기척을 느낀 그녀가 두 손을 앞에 모은 뒤 살짝 미소짓는 얼굴로 이쪽을 바라본다.\n
    <span style="color:yellow">1</span> - 대화하기
    <span style="color:yellow">2</span> - 치료받기
    <span style="color:yellow">3</span> - 돌아가기\n`,
};
