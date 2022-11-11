// import { Monsters } from '../db/models';

class DungeonService {
    getDungeonList = () => {
        let tempScript: string = '';

        this.dungeons.forEach((dungeon) => {
            tempScript += `${dungeon.no}. `;
            tempScript += `${dungeon.name}(`;
            tempScript += `${dungeon.level})\n\n`;
        });

        return tempScript;
    };

    getDungeonInfo = (dungeonNumber: number) => {
        const target = this.dungeons[dungeonNumber - 1];

        if (!target) return null;

        let tempScript: string = '';

        tempScript += `${target.no}. `;
        tempScript += `${target.name}(`;
        tempScript += `${target.level})\n`;
        tempScript += `${target.script}\n`;
        tempScript += `${target.mops} 등의 몬스터가 출현한다\n\n`;

        return tempScript;
    };

    dungeons = [
        {
            no: 1,
            name: '알비 던전',
            level: 'Lv. 0~9',
            script: '코네일 마을의 던전. 비교적 약한 마물들이 출현하여 전투의 기본을 익히기 좋은 곳이다.',
            mops: '고블린, 시골쥐, 작은 거미, 거대 거미',
        },
        {
            no: 2,
            name: '라비 던전',
            level: 'Lv. 10~19',
            script: '지속적으로 마을을 위협하는 스켈레톤이 소환되는 던전.',
            mops: '스켈레톤, 메탈 스켈레톤, 홉 고블린, 골렘',
        },
        {
            no: 3,
            name: '칼페온 신전',
            level: 'Lv. 20~29',
            script: '과거 칼페온 외곽의 신전이었지만 지금은 이교도들이 점령하여 흑마술을 연구하고있다.',
            mops: '이단신도, 수습사제, 심문관, 교주 바알',
        },
        {
            no: 4,
            name: '마왕성 주변',
            level: 'Lv. 30~39',
            script: '이곳에서 멀쩡히 돌아온 사람은 아무도 없다.',
            mops: '데미 리치, 반시, 마스터 리치, 그림 리퍼',
        },
        {
            no: 5,
            name: '마왕성',
            level: 'Lv. 40~50',
            script: '마왕 큐티폴리베어의 성.',
            mops: '서큐버스, 인큐버스, 마왕 폴리베어',
        },
    ];
}

export default new DungeonService();