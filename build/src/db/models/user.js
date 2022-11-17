"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../config/connection"));
const character_1 = __importDefault(require("./character"));
class Users extends sequelize_1.Model {
    static associate() {
        this.hasOne(character_1.default, {
            sourceKey: 'userId',
            foreignKey: 'userId'
        });
    }
}
Users.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: (Date.now() / 1000) | 0 + 60 * 60 * 9,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: (Date.now() / 1000) | 0 + 60 * 60 * 9,
    },
}, {
    sequelize: connection_1.default,
    modelName: "Users"
});
exports.default = Users;
