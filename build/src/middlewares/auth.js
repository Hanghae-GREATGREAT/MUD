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
const cache_1 = require("../db/cache");
const common_1 = require("../common");
/**
 *
 * 공통 미들웨어
 * 비로그인 > locals.user = null > 홈 리다이렉션
 * 로그인 > locals.user = sessionData > next
 *
 */
exports.default = {
    authMiddleware: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const ip = req.socket.remoteAddress;
        if (!ip) {
            throw new common_1.HttpException('잘못된 접근입니다', common_1.HttpStatus.BAD_REQUEST);
        }
        console.log(ip);
        const sessionData = yield cache_1.redis.get(ip);
        if (!sessionData) {
            req.app.locals.user = null;
            return res.redirect('/');
        }
        req.app.locals.user = JSON.parse(sessionData);
        next();
    })
};
