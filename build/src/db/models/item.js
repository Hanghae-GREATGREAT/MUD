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
// import { ItemInputForm } from '../../interfaces/interface';
class Items extends sequelize_1.Model {
    static associate() { }
    /***************************************************************
     * 장비 전체목록 불러오기, 불러오고 나서 type으로 걸러줄지,
     * type으로 조회해올지 고민
     ***************************************************************/
    static itemList() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Items.findAll();
        });
    }
}
Items.init({
    itemId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    npcId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        //   references: {
        //       model: 'Npcs',
        //       key: 'npcId'
        //   }
    },
    monsterId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        //   references: {
        //       model: 'Monsters',
        //       key: 'monsterId'
        //   }
    },
    name: sequelize_1.DataTypes.STRING(40),
    attack: sequelize_1.DataTypes.INTEGER.UNSIGNED,
    defense: sequelize_1.DataTypes.INTEGER.UNSIGNED,
    type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
}, {
    sequelize: connection_1.default,
    modelName: 'Items',
    timestamps: false,
});
exports.default = Items;
