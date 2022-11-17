"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../config/connection"));
const character_1 = __importDefault(require("./character"));
class Titles extends sequelize_1.Model {
    static associate() {
        this.hasMany(character_1.default, {
            sourceKey: 'titleId',
            foreignKey: 'titleId'
        });
    }
}
Titles.init({
    titleId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(40),
        allowNull: false,
    },
}, {
    sequelize: connection_1.default,
    modelName: "Titles",
    timestamps: false,
});
exports.default = Titles;
