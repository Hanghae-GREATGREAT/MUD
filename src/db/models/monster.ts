import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';
import sequelize from '../config/connection';
import { Characters, Fields} from '../models';
import { MonsterInputForm } from '../../interfaces/monster';


class Monsters extends Model<
    InferAttributes<Monsters>,
    InferCreationAttributes<Monsters>
> {
    declare monsterId: CreationOptional<number>;
    declare characterId: ForeignKey<number>;
    declare fieldId: ForeignKey<number>;

    declare name: string;
    declare type: number;
    declare hp: number;
    declare attack: number;
    declare defense: number;
    declare exp: number;

    static associate() {
        this.belongsTo(Characters, {
            targetKey: 'characterId',
            foreignKey: 'characterId'
        });
        this.belongsTo(Fields, {
            targetKey: 'fieldId',
            foreignKey: 'fieldId',
        });
    }
    /***************************************************************
     * 확률에 따른 몬스터 등급 정하는 함수
     ***************************************************************/
    static isRere() {
        // 랜덤값 생성(1~100)
        const ranNum: number = Math.floor(Math.random() * 99 + 1);

        // 몬스터의 타입을 결정, 일반, 정예, 보스 순
        const type: number[] = [2, 1, 0];
        // 각 희귀도에 따른 등장확률
        const isRere: number[] = [2, 28, 70];

        let res: number;

        for (let i = 0; i < type.length; i++) {
            if (isRere[i] >= ranNum) {
                res = type[i];
                return res;
            } else if (isRere[isRere.length - 1] < ranNum) {
                res = type[type.length - 1];
                return res;
            }
        }
    }

    /***************************************************************
     * 해당 던전의 몬스터 생성
     ***************************************************************/
    static async createMonster(fieldId: number, characterId: number) {
        // 여기에 일반, 희귀, 보스 몬스터를 결정할 확률을 만드는 코드를 만들자.
        // 0이 나올 확률은 80, 1은 15, 2는 5
        // 기본적으로 monsterId 1, 2, 3 은 첫 던전의 일반 3가지 몬스터
        // 경험치 획득량은 캐릭터 필요 경험치랑 참고하자.
        // 확률적으로 1이 나오면 이름 앞에 '정예'를 넣어주고 각 능력치가 1.5배
        // 2가 나오면 이름앞에 '보스'를 넣어주고 각 능력치가 3배

        const first: string[] = ['다람쥐', '고슴도치', '늑대'];
        const second: string[] = ['고슴도치', '고블린', '고블린 대장'];
        const therd: string[] = ['고블린', '오크', '오크 대장'];
        const fourth: string[] = ['오크', '도적', '도적 대장'];
        const fifth: string[] = ['도적', '좀비', '좀비 숙주'];
        const sixth: string[] = ['좀비', '구울', '리치'];
        const seventh: string[] = ['구울', '임프', '데몬 임프'];
        const eighth: string[] = ['임프', '머미', '디아블로'];
        const ninth: string[] = ['머미', '리퍼', '메피스토'];
        const tenth: string[] = ['리퍼', '뱀파이어', '바알'];

        const names = [
            '뮤츠',
            first,
            second,
            therd,
            fourth,
            fifth,
            sixth,
            seventh,
            eighth,
            ninth,
            tenth,
        ];
        let name: string;
        let ratio: number;
        let type = this.isRere();
        if (type === 0) {
            name = names[fieldId][0];
            ratio = fieldId * 1;
        }
        if (type === 1) {
            name = names[fieldId][1];
            ratio = fieldId * 1.5;
        }
        if (type === 2) {
            name = names[fieldId][2];
            ratio = fieldId * 3;
        }

        const defaultMonster = {
            hp: 50,
            attack: 5,
            defense: 5,
            exp: 10,
        };
        if (!type) type = 0;
        const dumyMonsters: MonsterInputForm = {
            characterId,
            fieldId,
            type,
            name: name!,
            hp: Math.ceil(defaultMonster.hp * ratio!),
            attack: Math.ceil(defaultMonster.attack * ratio!),
            defense: Math.ceil(defaultMonster.defense * ratio!),
            exp: Math.ceil(defaultMonster.exp * ratio!),
        };
        return await Monsters.create(dumyMonsters);
    }
}

Monsters.init(
    {
        monsterId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        characterId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'Characters',
                key: 'characterId'
            }
        },
        fieldId: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'Fields',
                key: 'fieldId'
            }
        },
        name: DataTypes.STRING(40),
        type: DataTypes.TINYINT.UNSIGNED,
        hp: DataTypes.SMALLINT,
        attack: DataTypes.SMALLINT.UNSIGNED,
        defense: DataTypes.SMALLINT.UNSIGNED,
        exp: DataTypes.SMALLINT.UNSIGNED,
    },
    {
        sequelize,
        modelName: 'Monsters',
        timestamps: false,
    }
);

export default Monsters;
