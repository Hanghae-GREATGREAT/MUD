"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.npc = exports.NpcList = exports.village = exports.dungeonList = exports.dungeon = exports.front = exports.battle = void 0;
const battle_1 = __importDefault(require("./battle"));
exports.battle = battle_1.default;
const dungeonHandler_1 = __importStar(require("./dungeonHandler"));
exports.dungeon = dungeonHandler_1.default;
Object.defineProperty(exports, "dungeonList", { enumerable: true, get: function () { return dungeonHandler_1.dungeonList; } });
const villageHandler_1 = __importStar(require("./villageHandler"));
exports.village = villageHandler_1.default;
Object.defineProperty(exports, "NpcList", { enumerable: true, get: function () { return villageHandler_1.NpcList; } });
const npc_1 = __importDefault(require("./npc"));
exports.npc = npc_1.default;
const front_1 = __importDefault(require("./front"));
exports.front = front_1.default;
