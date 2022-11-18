"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = __importDefault(require("./action"));
const battle_Handler_1 = __importDefault(require("./battle.Handler"));
const encounter_Handler_1 = __importDefault(require("./encounter.Handler"));
const fight_Handler_1 = __importDefault(require("./fight.Handler"));
const adventureResult_handler_1 = __importDefault(require("./adventureResult.handler"));
exports.default = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, action_1.default), battle_Handler_1.default), encounter_Handler_1.default), fight_Handler_1.default), adventureResult_handler_1.default);
