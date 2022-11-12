import sequelize from '../config/connection';
import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    NonAttribute,
} from 'sequelize';
import { Users, Titles, Fields, Items, Skills, Monsters } from '../models';
import { UserSession } from '../../interfaces/user';
import { MonsterService } from '../../services';

/***************************************************************
 * 레벨별 필요 경험치
 ***************************************************************/
class ExpMap {
    private readonly expReq: Map<number, number>;

    constructor() {
        this.expReq = new Map();
        let sum = 50;
        this.expReq.set(1, sum);
        const exp = [0, 50];
        for (let i = 2; i < 101; i++) {
            const e = exp[i - 1] + 20 * ((i / 5 + 1) | 0) ** 2;
            exp.push(e);
            sum += e;
            this.expReq.set(i, sum);
        }
    }
    get = (level: number) => {
        return this.expReq.get(level);
    };
}

class Characters extends Model<
    InferAttributes<Characters>,
    InferCreationAttributes<Characters>
> {
    declare characterId: CreationOptional<number>;
    declare userId: ForeignKey<number>;
    declare titleId: ForeignKey<number>;
    declare fieldId: ForeignKey<number>;

    declare name: CreationOptional<string>;
    declare job: CreationOptional<string>;
    declare level: CreationOptional<number>;
    declare attack: CreationOptional<number>;
    declare defense: CreationOptional<number>;
    declare maxhp: CreationOptional<number>;
    declare maxmp: CreationOptional<number>;
    declare hp: CreationOptional<number>;
    declare mp: CreationOptional<number>;
    declare exp: CreationOptional<number>;
    declare item: CreationOptional<string>;
    declare skill: CreationOptional<string>;

    declare createdAt: CreationOptional<number>;
    declare updatedAt: CreationOptional<number>;

    declare User: NonAttribute<Users>;
    declare Title: NonAttribute<Titles>;
    declare Field: NonAttribute<Fields>;

    private expMap: NonAttribute<ExpMap> = new ExpMap();
    declare addExp: (
        characterId: number,
        exp: number,
    ) => Promise<UserSession | null>;

    static associate() {
        this.hasMany(Monsters, {
            sourceKey: 'characterId',
            foreignKey: 'characterId'
        });
        this.belongsTo(Users, {
            targetKey: 'userId',
            foreignKey: 'userId',
        });
        this.belongsTo(Titles, {
            targetKey: 'titleId',
            foreignKey: 'titleId',
        });
        this.belongsTo(Fields, {
            targetKey: 'fieldId',
            foreignKey: 'fieldId',
        });
    }

    /***************************************************************
     * 전투 종료 후 경험치&레벨 계산
     ***************************************************************/
    static levelCalc(exp: number, level: number) {
        const reqExp =
            Characters.getInstance().expMap.get(level) ||
            Number.MAX_SAFE_INTEGER;

        return exp >= reqExp ? level + 1 : level;
    }    

    static async getSessionData(character: Partial<Characters>) {
        if (!character) {
            return null;
        }

        const getItems = await Items.findAll({
            where: {
                itemId: character.item!.split(':'),
            },
        });
        const getSkills = await Skills.findAll({
            where: {
                skillId: character.skill!.split(':'),
            },
        });

        return {
            userId: Number(character.userId),
            characterId: Number(character.characterId),
            name: character.name!.toString(),
            level: Number(character.level),
            maxhp: Number(character.maxhp),
            maxmp: Number(character.maxmp),
            hp: Number(character.hp),
            mp: Number(character.mp),
            exp: Number(character.exp),
            item: getItems.map((item) => item.get()),
            skill: getSkills.map((skill) => skill.get()),
        };
    }

    static getInstance(): Characters {
        return new Characters();
    }

    getExpRequire(level: number) {
        return this.expMap.get(level);
    }
}

Characters.init(
    {
        characterId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'userId',
            },
        },
        titleId: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Titles',
                key: 'titleId',
            },
        },
        fieldId: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'Fields',
                key: 'fieldId',
            },
        },

        name: {
            type: DataTypes.STRING(40),
            defaultValue: 'empty character',
        },
        job: {
            type: DataTypes.STRING(40),
            defaultValue: 'novice',
        },
        level: {
            type: DataTypes.TINYINT.UNSIGNED,
            defaultValue: 1,
        },
        attack: {
            type: DataTypes.SMALLINT.UNSIGNED,
            defaultValue: 10,
        },
        defense: {
            type: DataTypes.SMALLINT.UNSIGNED,
            defaultValue: 10,
        },
        maxhp: {
            type: DataTypes.SMALLINT.UNSIGNED,
            defaultValue: 100,
        },
        maxmp: {
            type: DataTypes.SMALLINT.UNSIGNED,
            defaultValue: 100,
        },
        hp: {
            type: DataTypes.SMALLINT,
            defaultValue: 100,
        },
        mp: {
            type: DataTypes.SMALLINT.UNSIGNED,
            defaultValue: 100,
        },
        exp: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        item: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        skill: {
            type: DataTypes.STRING,
            defaultValue: '',
        },

        createdAt: {
            type: DataTypes.INTEGER,
            defaultValue: (Date.now() / 1000) | (0 + 60 * 60 * 9),
        },
        updatedAt: {
            type: DataTypes.INTEGER,
            defaultValue: (Date.now() / 1000) | (0 + 60 * 60 * 9),
        },
    },
    {
        sequelize,
        modelName: 'Characters',
    },
);

export default Characters;

// 로그 증가분에 따른 expReq 템플릿
// const exp = [0, 50];
// for (let i=2; i<101; i++) {
//     const M = (50*log(10*i) - 50*log(10*(i-1)));
//     const next = (exp[i-1] + exp[i-1]*(M/10))|0;
//     exp.push(next);
// }
