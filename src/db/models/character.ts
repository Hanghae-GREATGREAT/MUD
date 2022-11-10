import sequelize from '../config/connection';
import { 
    Model, DataTypes,
    InferAttributes, InferCreationAttributes,
    CreationOptional, ForeignKey, NonAttribute
} from 'sequelize';
import { Users, Titles, Fields } from '../models';
import { UserSession } from '../../interfaces/user'


/***************************************************************
 * 레벨별 필요 경험치
 ***************************************************************/
class ExpMap {
    private readonly expReq: Map<number, number>;

    constructor() {
        this.expReq = new Map();
        let sum = 50
        this.expReq.set(1, sum);
        const exp = [0, 50];
        for (let i=2; i<101; i++) {
            const e = exp[i-1] + 20 * ((i/5 +1)|0)**2
            exp.push(e);
            sum += e;
            this.expReq.set(i, sum);
        }
    }
    get = (level: number) => {
        return this.expReq.get(level);
    }
}



class Characters extends Model<
    InferAttributes<Characters>, InferCreationAttributes<Characters>
> {
    declare characterId: CreationOptional<number>
    declare userId: ForeignKey<number>
    declare titleId: ForeignKey<number>
    declare fieldId: ForeignKey<number>

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

    declare createdAt: CreationOptional<number>;
    declare updatedAt: CreationOptional<number>;

    declare User: NonAttribute<Users>;
    declare Title: NonAttribute<Titles>;
    declare Field: NonAttribute<Fields>;

    private expMap: NonAttribute<ExpMap> = new ExpMap();
    declare addExp: (characterId: number, exp: number) => Promise<UserSession | null>

    static associate() {
        this.belongsTo(Users, {
            targetKey: 'userId',
            foreignKey: 'userId'
        });
        this.belongsTo(Titles, {
            targetKey: 'titleId',
            foreignKey: 'titleId'
        });
        this.belongsTo(Fields, {
            targetKey: 'fieldId',
            foreignKey: 'fieldId'
        });
    }

    /***************************************************************
     * 전투 턴이 종료되고 hp, mp 상태 갱신
     ***************************************************************/
    static async refreshStatus(characterId: number, damage: number, cost: number): Promise<UserSession | null> {
        const result = await Characters.findByPk(characterId, {
            include: [ Users, Fields, Titles ]
        });
        // const questId = await QuestCompletes.findOne()        
        if (!result) return null;

        const { hp, mp } = result.get();
        const newHp = hp - damage > 0 ? hp - damage : 0;
        const newMp = mp - cost > 0 ? mp - cost : 0;
        result.update({ hp: newHp, mp: newMp });

        return {
            username: result.User.getDataValue('username'),
            name: result.get('name'),
            level: result.get('level'),
            maxhp: result.get('maxhp'),
            maxmp: result.get('maxmp'),
            hp: newHp,
            mp: newMp,
            exp: result.get('exp'),
            questId: 1
        }
    }

    /***************************************************************
     * 전투 종료 후 경험치&레벨 계산
     ***************************************************************/
    private static levelCalc(exp:number, level: number) {
        const reqExp = Characters.getInstance().expMap.get(level) || Number.MAX_SAFE_INTEGER;

        return exp >= reqExp ? level + 1 : level;
    }    

    static async addExp(characterId: number, exp: number): Promise<UserSession | null> {
        const result = await Characters.findByPk(characterId, {
            include: [ Users, Fields, Titles ]
        });
        if (!result) return null;

        await result.increment({ exp });

        const level = this.levelCalc(result.get('exp')+exp, result.get('level'));
        let levelup = false;
        if (level > result.get('level')) {
            levelup = true;
            await result.increment({ level: 1 });
        }

        return {
            username: result.User.getDataValue('username'),
            name: result.get('name'),
            level, levelup,
            maxhp: result.get('maxhp'),
            maxmp: result.get('maxmp'),
            hp: result.get('hp'),
            mp: result.get('mp'),
            exp: result.get('exp') + exp,
            questId: 1,
        }
    }

    static getInstance(): Characters {
        return new Characters();
    }
    
    getExpRequire(level: number) {
        return this.expMap.get(level);
    }
};

Characters.init({
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
            key: 'userId'
        }
    },
    titleId: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'Titles',
            key: 'titleId'
        }
    },
    fieldId: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'Fields',
            key: 'fieldId'
        }
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
        defaultValue: 0,
    },
    attack: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    defense: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    maxhp: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    maxmp: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    hp: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    mp: {
        type: DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 0,
    },
    exp: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
    },

    createdAt: {
        type: DataTypes.INTEGER,
        defaultValue: (Date.now()/1000)|0 + 60 * 60 * 9,
      },
      updatedAt: {
        type: DataTypes.INTEGER,
        defaultValue: (Date.now()/1000)|0 + 60 * 60 * 9,
      },
}, {
    sequelize,
    modelName: 'Characters'
});

export default Characters;



// 로그 증가분에 따른 expReq 템플릿
// const exp = [0, 50];
// for (let i=2; i<101; i++) {
//     const M = (50*log(10*i) - 50*log(10*(i-1)));
//     const next = (exp[i-1] + exp[i-1]*(M/10))|0;
//     exp.push(next);
// }