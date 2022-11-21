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
const cache_1 = require("../../db/cache");
const services_1 = require("../../services");
const models_1 = require("../../db/models");
const scripts_1 = require("../../scripts");
exports.default = {
    signupUsername: (CMD, userCache) => {
        const script = scripts_1.signupScript.username;
        const field = 'sign:10';
        return { script, userCache, field };
    },
    signupPassword: (CMD, userCache, id) => __awaiter(void 0, void 0, void 0, function* () {
        const username = CMD;
        const result = yield services_1.UserService.dupCheck(username);
        userCache.username = username;
        const script = !result ? scripts_1.signupScript.password : scripts_1.signupScript.dupUser;
        const field = !result ? 'sign:11' : 'sign:10';
        return { script, userCache, field };
    }),
    createUser: (CMD, userCache, id) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('CREATE USER');
        const userCreated = yield services_1.UserService.signup({ username: userCache.username, password: CMD });
        userCache.userId = userCreated.getDataValue('userId');
        const script = scripts_1.signupScript.create;
        const field = 'sign:12';
        return { script, userCache, field };
    }),
    createCharacter: (CMD, userCache, id) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('CREATE CHARACTER');
        const name = CMD;
        const userId = userCache.userId;
        const character = yield services_1.CharacterService.createNewCharacter({ name, userId });
        const userSession = {
            userId,
            characterId: character === null || character === void 0 ? void 0 : character.characterId,
        };
        // await redis.hSet(id, userSession);
        const data = JSON.stringify(userSession);
        yield cache_1.redis.set(id, data, { EX: 60 * 5 });
        const newCharacter = yield models_1.Characters.getSessionData(character);
        userCache = Object.assign(userCache, newCharacter);
        const script = scripts_1.signupScript.title;
        const field = 'front';
        return { script, userCache, field };
    }),
};
