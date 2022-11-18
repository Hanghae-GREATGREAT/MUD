"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
const models_1 = require("../../db/models");
const cache_1 = require("../../db/cache");
const scripts_1 = require("../../scripts");
exports.default = {
    signinUsername: (CMD, user) => {
        const script = scripts_1.signinScript.username;
        const field = 'sign:20';
        return { script, user, field };
    },
    signinPassword: (CMD, user) => __awaiter(void 0, void 0, void 0, function* () {
        user.username = CMD;
        const script = scripts_1.signinScript.password;
        const field = 'sign:21';
        return { script, user, field };
    }),
    signinCheck: (CMD, user, id) => __awaiter(void 0, void 0, void 0, function* () {
        const username = user.username;
        const password = CMD;
        const result = yield services_1.UserService.signin({ username, password });
        const userId = (result === null || result === void 0 ? void 0 : result.userId) || 0;
        const character = yield services_1.CharacterService.findOneByUserId(userId);
        const userSession = {
            userId,
            characterId: character === null || character === void 0 ? void 0 : character.characterId,
        };
        // await redis.hSet(id, userSession);
        const data = JSON.stringify(userSession);
        yield cache_1.redis.set(id, data, { EX: 60 * 5 });
        if (character) {
            const characterSession = yield models_1.Characters.getSessionData(character);
            user = Object.assign(user, characterSession);
        }
        const script = result ? scripts_1.signinScript.title : scripts_1.signinScript.incorrect;
        const field = result ? 'front' : 'sign:21';
        return { script, user, field };
    }),
};
