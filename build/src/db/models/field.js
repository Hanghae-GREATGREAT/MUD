"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../config/connection"));
const character_1 = __importDefault(require("./character"));
class Fields extends sequelize_1.Model {
    static associate() {
        this.hasMany(character_1.default, {
            sourceKey: 'fieldId',
            foreignKey: 'fieldId'
        });
    }
}
Fields.init({
    fieldId: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(40),
        allowNull: false,
    },
    level: {
        type: sequelize_1.DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    sequelize: connection_1.default,
    modelName: "Fields",
    timestamps: false,
});
exports.default = Fields;
