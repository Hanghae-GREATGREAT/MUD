"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const config_env_1 = __importDefault(require("../../config.env"));
const sequelize = new sequelize_1.Sequelize({
    host: config_env_1.default.DB_HOST,
    database: config_env_1.default.DB_NAME,
    username: config_env_1.default.DB_USER,
    password: config_env_1.default.DB_PASSWORD,
    dialect: 'mysql',
    // logging: false,
});
exports.default = sequelize;
