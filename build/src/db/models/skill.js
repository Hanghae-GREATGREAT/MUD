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
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../config/connection"));
// import { SkillInputForm } from '../../interfaces/interface';
class Skills extends sequelize_1.Model {
    static associate() { }
    /***************************************************************
     * 스킬 전체목록 불러오기
     ***************************************************************/
    static skillList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Skills.findAll();
        });
    }
}
Skills.init({
    skillId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: sequelize_1.DataTypes.STRING(40),
    type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
    cost: sequelize_1.DataTypes.INTEGER.UNSIGNED,
    multiple: sequelize_1.DataTypes.INTEGER.UNSIGNED,
}, {
    sequelize: connection_1.default,
    modelName: 'Skills',
    timestamps: false,
});
exports.default = Skills;
