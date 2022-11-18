"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const config_env_1 = __importDefault(require("../../config.env"));
const connection = mysql2_1.default.createConnection({
    host: config_env_1.default.DB_HOST,
    user: config_env_1.default.DB_USER,
    password: config_env_1.default.DB_PASSWORD,
});
(() => {
    connection.query(`
        DROP DATABASE IF EXISTS ${config_env_1.default.DB_NAME};
    `);
    connection.query(`
        CREATE DATABASE IF NOT EXISTS ${config_env_1.default.DB_NAME};
    `);
    connection.end();
})();
