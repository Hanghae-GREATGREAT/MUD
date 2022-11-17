"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../config/connection"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
/***************************************************************
 * 레벨별 필요 경험치
 ***************************************************************/
class ExpMap {
    constructor() {
        this.get = (level) => {
            return this.expReq.get(level);
        };
        this.expReq = new Map();
        let sum = 50;
        this.expReq.set(1, sum);
        const exp = [0, 50];
        for (let i = 2; i < 101; i++) {
            const e = exp[i - 1] + 20 * Math.pow(((i / 5 + 1) | 0), 2);
            exp.push(e);
            sum += e;
            this.expReq.set(i, sum);
        }
    }
}
class Characters extends sequelize_1.Model {
    constructor() {
        super(...arguments);
        this.expMap = new ExpMap();
    }
    static associate() {
        this.hasMany(models_1.Monsters, {
            sourceKey: 'characterId',
            foreignKey: 'characterId'
        });
        this.belongsTo(models_1.Users, {
            targetKey: 'userId',
            foreignKey: 'userId',
        });
        this.belongsTo(models_1.Titles, {
            targetKey: 'titleId',
            foreignKey: 'titleId',
        });
        this.belongsTo(models_1.Fields, {
            targetKey: 'fieldId',
            foreignKey: 'fieldId',
        });
    }
    /***************************************************************
     * 전투 종료 후 경험치&레벨 계산
     ***************************************************************/
    static levelCalc(exp, level) {
        const reqExp = Characters.getInstance().expMap.get(level) ||
            Number.MAX_SAFE_INTEGER;
        return exp >= reqExp ? level + 1 : level;
    }
    static getSessionData(character) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!character) {
                return null;
            }
            const getItems = yield models_1.Items.findAll({
                where: {
                    itemId: character.item.split(':'),
                },
            });
            const getSkills = yield models_1.Skills.findAll({
                where: {
                    skillId: character.skill.split(':'),
                },
            });
            return {
                userId: Number(character.userId),
                characterId: Number(character.characterId),
                name: character.name.toString(),
                level: Number(character.level),
                maxhp: Number(character.maxhp),
                maxmp: Number(character.maxmp),
                hp: Number(character.hp),
                mp: Number(character.mp),
                exp: Number(character.exp),
                item: getItems.map((item) => item.get()),
                skill: getSkills.map((skill) => skill.get()),
            };
        });
    }
    static getInstance() {
        return new Characters();
    }
    getExpRequire(level) {
        return this.expMap.get(level);
    }
}
Characters.init({
    characterId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userId',
        },
    },
    titleId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'Titles',
            key: 'titleId',
        },
    },
    fieldId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'Fields',
            key: 'fieldId',
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING(40),
        defaultValue: 'empty character',
    },
    job: {
        type: sequelize_1.DataTypes.STRING(40),
        defaultValue: 'novice',
    },
    level: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        defaultValue: 1,
    },
    attack: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 10,
    },
    defense: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 10,
    },
    maxhp: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 100,
    },
    maxmp: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 100,
    },
    hp: {
        type: sequelize_1.DataTypes.SMALLINT,
        defaultValue: 100,
    },
    mp: {
        type: sequelize_1.DataTypes.SMALLINT.UNSIGNED,
        defaultValue: 100,
    },
    exp: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
    },
    item: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: '',
    },
    skill: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: '',
    },
    createdAt: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: (Date.now() / 1000) | (0 + 60 * 60 * 9),
    },
    updatedAt: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: (Date.now() / 1000) | (0 + 60 * 60 * 9),
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Characters',
});
exports.default = Characters;
// 로그 증가분에 따른 expReq 템플릿
// const exp = [0, 50];
// for (let i=2; i<101; i++) {
//     const M = (50*log(10*i) - 50*log(10*(i-1)));
//     const next = (exp[i-1] + exp[i-1]*(M/10))|0;
//     exp.push(next);
// }
