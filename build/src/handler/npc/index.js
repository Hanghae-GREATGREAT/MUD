"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const story_1 = __importDefault(require("./story"));
const heal_1 = __importDefault(require("./heal"));
const enhance_1 = __importDefault(require("./enhance"));
const gamble_1 = __importDefault(require("./gamble"));
exports.default = Object.assign(Object.assign(Object.assign(Object.assign({}, story_1.default), heal_1.default), enhance_1.default), gamble_1.default);
