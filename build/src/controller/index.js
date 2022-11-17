"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.village = exports.home = exports.field = exports.chat = exports.battle = void 0;
const battle_1 = __importDefault(require("./battle"));
exports.battle = battle_1.default;
const chat_1 = __importDefault(require("./chat"));
exports.chat = chat_1.default;
const field_1 = __importDefault(require("./field"));
exports.field = field_1.default;
const home_1 = __importDefault(require("./home"));
exports.home = home_1.default;
const village_1 = __importDefault(require("./village"));
exports.village = village_1.default;
