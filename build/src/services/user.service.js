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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const models_1 = require("../db/models");
const cache_1 = require("../db/cache");
const _1 = require(".");
class UserService {
    signup({ username, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = {
                username: username,
                password: yield bcrypt_1.default.hash(password, 10),
            };
            return yield models_1.Users.create(user);
        });
    }
    signin({ username, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield models_1.Users.findOne({
                where: { username }
            });
            if (!user)
                return null;
            const result = yield bcrypt_1.default.compare(password, user.password);
            if (!result)
                return null;
            return user;
        });
    }
    dupCheck(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield models_1.Users.findOne({
                where: { username }
            });
            return Boolean(user);
        });
    }
    signout(userId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('SIGNOUT');
            // redis.hDelAll(id, { userId: 0, characterId: 0 });
            cache_1.redis.del(id);
        });
    }
    ;
    deleteUser(userId, characterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield _1.CharacterService.deleteCharacter(+userId, +characterId);
            if (result === 0)
                return 0;
            return yield models_1.Users.destroy({
                where: { userId }
            });
        });
    }
}
exports.default = new UserService();
