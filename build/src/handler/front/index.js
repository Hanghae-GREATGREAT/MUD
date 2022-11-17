"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const home_1 = __importDefault(require("./home"));
const signinHandler_1 = __importDefault(require("./signinHandler"));
const signupHandler_1 = __importDefault(require("./signupHandler"));
exports.default = Object.assign(Object.assign(Object.assign({}, home_1.default), signinHandler_1.default), signupHandler_1.default);
