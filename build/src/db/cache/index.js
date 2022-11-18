"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.battleCache = void 0;
const redis_1 = __importDefault(require("./redis"));
exports.redis = redis_1.default;
const battleMap_1 = __importDefault(require("./battleMap"));
exports.battleCache = battleMap_1.default;
