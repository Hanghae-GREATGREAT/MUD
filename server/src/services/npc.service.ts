import { Characters } from '../db/models';

class NpcService {
    /** 프라데이리 스크립트 랜덤 반환 */
    storyTalkScript(userName: string): string {
        const scripts: string[] = [
            `안녕하세요? ${userName}씨가 도착하기를 기다리고 있었어요.\n\n`,
            `제 이름은 '프라데이리'라고 해요.\n ${userName}씨의 모험록을 기록하는 것이 제 역할입니다.\n\n`,
            `저는 삶의 목표가 항상 '최고'일 필요는 없다고 생각해요.\n행복이라든가 즐거움 쪽이 더 좋은 목표가 아닐까요?\n\n`,
            `안녕하세요? 오늘은 어떤 모험이야기를 들려주실건가요?\n\n`,
        ];

        const randomIndex = Math.floor(Math.random() * scripts.length);

        return '프라데이리 : \n' + scripts[randomIndex];
    }

    /** 플레이어 레벨 만큼의 스토리 분량 반환 */
    story(userName: string, userLevel: number): string {
        let tempScript: string = '';

        // 스토리 스크립트
        const story: string[] = [
            `1 - 모험의 시작.\n모험가의 꿈을 안고 울라대륙으로 떠난 ${userName}.\n그의 모험은 지금부터 시작이다.\n\n`,
            `2 - 첫 보스급 몬스터 처치\n${userName}은 이제 모험가가 되었다.\n\n`,
            `3 - 도시로 상경\n${userName}의 모험록이 도시까지 퍼졌다.\n그의 모험은 지금부터 시작이다.\n\n`,
            `4 - 바튼의 뒷골목\n곤경에 처한 주민을 도와준 ${userName}.\n그의 바튼 모험은 이 때 시작되었다.\n\n`,
            `5 - 왕국의 지원요청\n${userName}의 모험록은 왕국까지 닿았다.\n마왕 폴리베어와의 전쟁이 예상되는데..\n\n`,
            `6 - 마왕 폴리베어\n${userName}, 그는 마왕 폴리베어와의 싸움에서 승리했다.\n그의 모험은 다시 시작이다.\n\n`,
        ];

        // 레벨만큼 공개
        for (let i = 0; i < userLevel; i++) {
            tempScript += story[i];
        }

        return tempScript;
    }

    /** 아그네스 스크립트 랜덤 반환 */
    healTalkScript(userName: string): string {
        const scripts: string[] = [
            `안녕하세요? ${userName}씨, 치료가 필요하신가요?.\n\n`,
            `가장 큰 어리석음은 다른 종류의 행복을 위해 건강을 희생하는 것이라고 하네요.\n${userName}씨도 너무 무리하지 마세요.\n\n`,
            `삶을 행복하게 하는 세 가지는 '건강, 사명, 사랑하는사람' 이라는 말이 있어요.\n${userName}씨는 사랑하는 사람이 있나요?\n\n`,
            `너무 자주 오시는 것도 안 좋아요. ${userName}씨.\n사실 정말로 힐러의 도움이 필요한 건 몹시 아픈 사람들이니까요.\n\n`,
            `어서오세요. ${userName}씨.\n어디 불편하하신 데가 있으세요?\n\n`,
        ];

        const randomIndex = Math.floor(Math.random() * scripts.length);

        return '아그네스 : \n' + scripts[randomIndex];
    }

    /** 힐러 상호작용 */
    async healing(characterId: number): Promise<string> {
        const Character = await Characters.findByPk(characterId);

        if (!Character) {
            throw new Error('Healing Error : Character not found');
        }

        if (Character.maxhp === Character.hp) {
            return '아그네스 : 특별히 치료하실만한 상처는 안 보이는데요?\n마음의 상처라면 치료보다 상담을 받아보시는 게 어떤가요?\n\n';
        }

        await Character.update({
            hp: Character.maxhp,
            mp: Character.maxmp,
        });

        return `아그네스의 손으로부터 나타난 밝은 빛의 마나가 상처로 스며든다..\n\n아그네스 : ${Character.name}님, 부디 몸조심하세요.\n\n`;
    }

    /** 퍼거스 스크립트 랜덤 반환 */
    enhanceTalkScript(userName: string): string {
        const scripts: string[] = [
            `이게 누구야? ${userName}..? 장비를 강화하려는 겐가?.\n\n`,
            `미끄러지듯 손에 감기는 촉감이 역시 퍼거스 전용 망치 답구려.\n\n`,
            `노래는 근로의 의욕을 높여주지.\n\n`,
            `수염은 남자의 로망~로망~로마앙~ 이라네~.\n\n`,
            `어제 망치질을 너무 했나.. 팔이 좀 욱신거리네..\n\n`,
            `캬악~퉤! 어이~ ${userName}, 식사 많이 잡쉈어?\n\n`,
        ];

        const randomIndex = Math.floor(Math.random() * scripts.length);

        return '퍼거스 : \n' + scripts[randomIndex];
    }

    /** (임시) Attack 스탯 랜덤 강화 현재 30% */
    async enhance(characterId: number): Promise<string> {
        const Character = await Characters.findByPk(characterId);
        // 임시 스크립트 선언
        let tempScript = '';
        if (!Character) {
            throw new Error('Enhance Error : Character not found');
        }

        // 능력치 강화(임시)
        const successRate = Math.floor(Math.random() * 100);

        if (successRate < 30) {
            Character.update({
                attack: Character.attack + 10,
                exp: Character.exp - 10,
            });
            tempScript += '강화에 성공했습니다!! => Attack + 10\n\n';
            tempScript += '퍼거스 : 크하하! 이몸도 아직 죽지 않았다구!\n\n';
        } else {
            Character.update({
                exp: Character.exp - 10,
            });
            tempScript += '강화에 실패했습니다..\n\n';
            tempScript += '퍼거스 : 어이쿠.. 손이 미끄러졌네.. 헐..\n';
            tempScript += '퍼거스 : ...\n';
            tempScript +=
                '퍼거스 : 자, 자, 이미 이렇게 된거, 새로하나 장만... 응? 응?\n\n';
        }

        return tempScript;
    }

    /** 에트나 스크립트 랜덤 반환 */
    gambleTalkScript(userName: string): string {
        const scripts: string[] = [
            `안녕? ${userName}, 오늘은 이몸을 이길 수 있겠어?\n\n`,
            `선택을 망설이는 이유는 선택의 결과에 책임지지 않으려 하기 때문이지..\n${userName}, 네 생각은 어때?\n\n`,
            `겜블을 그 본연의 목적에 맞게 플레이한다면 결코 나쁜 것이 아니라는 말이 있지..\n그 본연의 목적이란 '재미와 오락'이래.\n\n`,
        ];

        const randomIndex = Math.floor(Math.random() * scripts.length);

        return '에트나 : \n' + scripts[randomIndex];
    }

    /** 에트나 겜블(주사위 대결) */
    async gamble(characterId: number): Promise<string> {
        // 캐릭터 정보 불러오기
        const Character = await Characters.findByPk(characterId);

        if (!Character) {
            throw new Error('Gamble Error : Character not found');
        }

        let tempScript: string =
            '다섯 번의 주사위 게임을 통해 랜덤한 성장 효과를 받을 수 있습니다.\n\n';
        let victoryPoint: number = 0;

        for (let i = 0; i < 5; i++) {
            tempScript += `=== ${i + 1} 번째 게임 ===\n`;
            const dealerDice = Math.floor(Math.random() * 6) + 1;
            const plsyerDice = Math.floor(Math.random() * 6) + 1;

            tempScript += `에트나의 주사위 : ${dealerDice} || ${Character.name}의 주사위 : ${plsyerDice}\n`;

            if (plsyerDice > dealerDice) {
                victoryPoint += 1;
                tempScript += `승리!\n`;
            } else {
                victoryPoint -= 1;
                tempScript += `패배..\n`;
            }
        }

        if (victoryPoint > 0) {
            tempScript += `\n결과 : ${Character.name}의 승리!\n\n`;
            tempScript += `에트나 : 오! ${Character.name}... 좀 하는걸?\n`;
            tempScript += `에트나 : 그치만 아직 보상이 구현되지 않았어 ㅋ\n\n`;
        } else {
            tempScript += `\n결과 : ${Character.name}의 패배..\n\n`;
            tempScript += `에트나 : 푸하하하! ${Character.name}, 아직 패널티가 구현되지 않은걸 다행으로 알아둬~\n\n`;
        }

        return tempScript;
    }
}

export default new NpcService();
